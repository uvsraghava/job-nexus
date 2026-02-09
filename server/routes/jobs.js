const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User'); 
const authMiddleware = require('../middleware/auth'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { analyzeResume } = require('../utils/ai'); 
require('dotenv').config();

// --- 1. LOCAL STORAGE CONFIG ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, uniqueSuffix + '-' + sanitizedName);
  }
});

const upload = multer({ storage: storage });

// --- ROUTES ---

// 1. Post Job
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ msg: 'Access denied' });
  try {
    const recruiterId = req.user.userId || req.user.id || req.user._id;
    const { title, company, location, salary, description, type, jobPolicy } = req.body;

    const trustedCount = await Job.countDocuments({ recruiterId: recruiterId, status: 'approved' });
    const initialStatus = trustedCount > 0 ? 'approved' : 'pending';

    const job = new Job({ 
      title, company, location, salary, description, type,
      jobPolicy: jobPolicy || 'Exclusive', 
      recruiterId: recruiterId,
      status: initialStatus 
    });
    
    await job.save();
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// 2. Get All Jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'approved' })
      .populate('recruiterId', 'name email')
      .sort({ postedAt: -1 });
    res.json(jobs);
  } catch (err) { res.status(500).send('Server Error'); }
});

// 3. Get Pending Jobs
router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const user = await User.findById(userId);
    
    if (!user || user.email !== 'drssm@gmail.com') return res.status(403).json({ msg: 'Access Denied' });

    const jobs = await Job.find({ status: 'pending' }).populate('recruiterId', 'name email').sort({ postedAt: -1 });
    res.json(jobs);
  } catch (err) { res.status(500).send('Server Error'); }
});

// 4. Approve Job
router.put('/approve/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const user = await User.findById(userId);
    if (!user || user.email !== 'drssm@gmail.com') return res.status(403).json({ msg: 'Access Denied' });

    await Job.findByIdAndUpdate(req.params.id, { status: 'approved' });
    res.json({ msg: 'Job Approved' });
  } catch (err) { res.status(500).send('Server Error'); }
});

// Reject Job
router.delete('/reject/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const user = await User.findById(userId);
    if (!user || user.email !== 'drssm@gmail.com') return res.status(403).json({ msg: 'Access Denied' });

    await Job.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Job Rejected' });
  } catch (err) { res.status(500).send('Server Error'); }
});

// 5. Update Status
router.put('/:id/application/:studentId', authMiddleware, async (req, res) => {
  try {
    const { status, feedback, interviewDate, interviewLink } = req.body; 
    const { id, studentId } = req.params;

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    const applicant = job.applicants.find(app => app.studentId.toString() === studentId);
    if (!applicant) return res.status(404).json({ msg: 'Applicant not found' });

    applicant.status = status;
    if (feedback) applicant.feedback = feedback;
    if (status === 'Interview Scheduled') {
      if (interviewDate) applicant.interviewDate = interviewDate;
      if (interviewLink) applicant.interviewLink = interviewLink;
    }

    await job.save();
    res.json({ msg: `Status updated` });
  } catch (err) { res.status(500).send('Server Error'); }
});

// 6. Delete Job
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    const currentUserId = req.user.userId || req.user.id || req.user._id;
    const user = await User.findById(currentUserId);
    const isOwner = job.recruiterId.toString() === currentUserId;
    const isMaster = user.email === 'drssm@gmail.com';

    if (!isOwner && !isMaster) return res.status(403).json({ msg: 'Not authorized' });

    await job.deleteOne();
    res.json({ msg: 'Job removed' });
  } catch (err) { res.status(500).send('Server Error'); }
});

// 7. Apply (UPDATED: Copies Global Score from User Profile)
router.post('/:id/apply', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    const studentId = req.user.userId || req.user.id || req.user._id;
    
    // Policy Check
    const allJobs = await Job.find({ "applicants.studentId": studentId });
    for (const j of allJobs) {
        const myApp = j.applicants.find(a => a.studentId.toString() === studentId.toString());
        if (myApp && myApp.status === 'Confirmed' && j.jobPolicy === 'Exclusive') {
            return res.status(400).json({ msg: `LOCKED: You have joined '${j.company}' (Exclusive).` });
        }
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    const alreadyApplied = job.applicants.some(app => app.studentId && app.studentId.toString() === studentId);
    if (alreadyApplied) return res.status(400).json({ msg: 'Already applied' });

    // --- FETCH STUDENT DATA FOR SCORE ---
    const student = await User.findById(studentId);
    
    // Save relative path using forward slashes for compatibility
    // Priority: Specific uploaded resume > Global profile resume
    const resumePath = req.file ? req.file.path.replace(/\\/g, "/") : student.resume;

    job.applicants.push({
      studentId: studentId,
      name: student.name, 
      email: student.email,
      resume: resumePath,
      // [NEW] COPY SCORE & FEEDBACK FROM PROFILE
      aiScore: student.resumeScore || null, 
      aiFeedback: student.resumeFeedback || null,
      status: 'Pending'
    });
    
    await job.save();
    res.json({ msg: 'Application successful' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// 8. Recruiter Jobs
router.get('/my-jobs', authMiddleware, async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ msg: 'Access denied' });
  try {
    const currentUserId = req.user.userId || req.user.id || req.user._id;
    const jobs = await Job.find({ recruiterId: currentUserId }).sort({ postedAt: -1 });
    res.json(jobs);
  } catch (err) { res.status(500).send('Server Error'); }
});

// 9. Withdraw
router.post('/:id/withdraw', authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.userId || req.user.id || req.user._id;
    const job = await Job.findById(req.params.id);
    job.applicants = job.applicants.filter(app => app.studentId.toString() !== studentId);
    await job.save();
    res.json({ msg: 'Withdrawn' });
  } catch (err) { res.status(500).send('Server Error'); }
});

// 10. Accept Offer
router.post('/:id/accept-offer', authMiddleware, async (req, res) => {
  try {
    const jobId = req.params.id;
    const studentId = req.user.userId || req.user.id || req.user._id;
    const targetJob = await Job.findById(jobId);
    const targetApp = targetJob.applicants.find(app => app.studentId.toString() === studentId.toString());
    
    // Smart Revert Logic
    const otherJobs = await Job.find({ "_id": { $ne: jobId }, "applicants.studentId": studentId });
    for (const job of otherJobs) {
      const app = job.applicants.find(a => a.studentId.toString() === studentId.toString());
      if (app && app.status !== 'Rejected' && app.status !== 'Withdrawn (System)') {
        app.status = 'Withdrawn (System)';
        await job.save();
      }
    }

    targetApp.status = 'Confirmed';
    await targetJob.save();
    res.json({ msg: 'Offer Accepted!' });
  } catch (err) { res.status(500).send('Server Error'); }
});

// --- 11. UNIVERSAL AI ROUTE (FALLBACK) ---
router.post('/:jobId/analyze/:studentId', authMiddleware, async (req, res) => {
  try {
    const { jobId, studentId } = req.params;
    const userId = req.user.userId || req.user.id || req.user._id;
    
    // 1. Permission Check
    if (req.user.role === 'student' && userId.toString() !== studentId) {
        return res.status(403).json({ msg: 'Access Denied' });
    }

    const job = await Job.findById(jobId);
    const applicant = job.applicants.find(app => app.studentId.toString() === studentId);

    // 2. Return Cached Score
    if (applicant.aiScore) {
        return res.json({ score: applicant.aiScore, reason: applicant.aiFeedback, cached: true });
    }

    // 3. Analyze
    if (!applicant.resume) return res.status(400).json({ msg: 'No resume found' });
    
    // Resolve Absolute Path using robust logic
    const absolutePath = path.resolve(__dirname, '..', applicant.resume); 

    // Safety Check
    if (!fs.existsSync(absolutePath)) {
        console.error("Resume file missing at:", absolutePath);
        return res.status(404).json({ msg: "Resume file not found on server." });
    }

    const analysis = await analyzeResume(absolutePath, job.description);

    // 4. Save Score
    applicant.aiScore = analysis.score;
    applicant.aiFeedback = analysis.reason;
    await job.save();

    res.json(analysis);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;