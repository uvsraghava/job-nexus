const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User'); 
const authMiddleware = require('../middleware/auth'); 
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config(); // Load environment variables

// --- CLOUDINARY CONFIGURATION ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'job-nexus-resumes', // Folder name in your Cloudinary console
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw' // Important for non-image files like PDFs
  },
});

const upload = multer({ storage: storage });

// --- ROUTES ---

// 1. Post Job (Auto-Approve Logic Preserved)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ msg: 'Access denied' });
  try {
    const recruiterId = req.user.userId || req.user.id || req.user._id;

    // Trust Score Logic
    const trustedCount = await Job.countDocuments({ 
      recruiterId: recruiterId, 
      status: 'approved' 
    });

    const initialStatus = trustedCount > 0 ? 'approved' : 'pending';

    const job = new Job({ 
      ...req.body, 
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

// 2. Get All Jobs (Public: Only 'Approved')
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'approved' })
      .populate('recruiterId', 'name email')
      .sort({ postedAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// 3. Get Pending Jobs (Master Faculty Only)
router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const user = await User.findById(userId);
    
    if (!user || user.email !== 'drssm@gmail.com') {
      return res.status(403).json({ msg: 'Access Denied: Only the Dean can view pending jobs.' });
    }

    const jobs = await Job.find({ status: 'pending' })
      .populate('recruiterId', 'name email')
      .sort({ postedAt: -1 });
      
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// 4. Approve Job (Master Faculty Only)
router.put('/approve/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const user = await User.findById(userId);
    
    if (!user || user.email !== 'drssm@gmail.com') {
      return res.status(403).json({ msg: 'Access Denied: Only the Dean can approve jobs.' });
    }

    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    job.status = 'approved';
    await job.save();

    res.json({ msg: 'Job Approved Successfully', job });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// 5. Update Status (UPDATED: Handles Feedback & Interviews)
router.put('/:id/application/:studentId', authMiddleware, async (req, res) => {
  try {
    const { status, feedback, interviewDate, interviewLink } = req.body; 
    const { id, studentId } = req.params;

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    const applicant = job.applicants.find(app => app.studentId.toString() === studentId);
    if (!applicant) return res.status(404).json({ msg: 'Applicant not found' });

    // Update Status
    applicant.status = status;

    // --- Save Feedback if provided ---
    if (feedback) {
      applicant.feedback = feedback;
    }

    // --- Save Interview Details if provided ---
    if (status === 'Interview Scheduled') {
      if (interviewDate) applicant.interviewDate = interviewDate;
      if (interviewLink) applicant.interviewLink = interviewLink;
    }

    await job.save();
    res.json({ msg: `Status updated to ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// 6. Delete Job (Master Faculty Override Preserved)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    const currentUserId = req.user.userId || req.user.id || req.user._id;
    const user = await User.findById(currentUserId);

    const isOwner = job.recruiterId.toString() === currentUserId;
    const isMaster = user.email === 'drssm@gmail.com';

    if (!isOwner && !isMaster) {
      return res.status(403).json({ msg: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    res.json({ msg: 'Job removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// 7. Apply (UPDATED: Now stores Cloudinary URL)
router.post('/:id/apply', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    const studentId = req.user.userId || req.user.id || req.user._id;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    const alreadyApplied = job.applicants.some(app => app.studentId && app.studentId.toString() === studentId);
    if (alreadyApplied) return res.status(400).json({ msg: 'You have already applied' });

    const student = await User.findById(studentId);
    
    // Cloudinary stores the file path in req.file.path automatically
    job.applicants.push({
      studentId: studentId,
      name: student.name, 
      email: student.email,
      resume: req.file ? req.file.path : null, // This is now a Cloud URL!
      status: 'Pending'
    });
    await job.save();
    res.json({ msg: 'Application successful' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// 8. Recruiter Jobs (Preserved)
router.get('/my-jobs', authMiddleware, async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ msg: 'Access denied' });
  try {
    const currentUserId = req.user.userId || req.user.id || req.user._id;
    const jobs = await Job.find({ recruiterId: currentUserId }).sort({ postedAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// 9. Withdraw (Preserved)
router.post('/:id/withdraw', authMiddleware, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ msg: 'Access denied' });
  try {
    const studentId = req.user.userId || req.user.id || req.user._id;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    job.applicants = job.applicants.filter(app => app.studentId.toString() !== studentId);
    await job.save();
    res.json({ msg: 'Application withdrawn' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// 10. Accept Offer (Preserved)
router.post('/:id/accept-offer', authMiddleware, async (req, res) => {
  console.log("--- ACCEPT OFFER DEBUG START ---");
  console.log("Job ID Requested:", req.params.id);
  console.log("User Token Payload:", req.user);

  if (req.user.role !== 'student') return res.status(403).json({ msg: 'Access denied' });
  
  try {
    const jobId = req.params.id;
    const studentId = req.user.userId || req.user.id || req.user._id;
    console.log("Resolved Student ID:", studentId);

    // 1. Find Job
    const targetJob = await Job.findById(jobId);
    if (!targetJob) {
      console.log("Job not found in DB");
      return res.status(404).json({ msg: 'Job not found' });
    }

    // 2. Find Applicant
    const targetApp = targetJob.applicants.find(app => app.studentId.toString() === studentId.toString());
    
    if (!targetApp) {
      console.log("Applicant not found in job. Applicants:", targetJob.applicants);
      return res.status(404).json({ msg: 'Application not found. Did you apply?' });
    }

    console.log("Current Status:", targetApp.status);

    if (targetApp.status !== 'Accepted') {
      return res.status(400).json({ msg: 'Recruiter has not Accepted this application yet.' });
    }

    // 3. EXECUTE LOGIC
    console.log("Status valid. Updating...");

    // A. Confirm this job
    targetApp.status = 'Confirmed';
    await targetJob.save();

    // B. Withdraw others
    const otherJobs = await Job.find({
      "_id": { $ne: jobId },
      "applicants.studentId": studentId
    });

    console.log(`Found ${otherJobs.length} other jobs to withdraw from.`);

    for (const job of otherJobs) {
      const app = job.applicants.find(a => a.studentId.toString() === studentId.toString());
      if (app && app.status !== 'Rejected' && app.status !== 'Confirmed') {
        app.status = 'Withdrawn (System)';
        await job.save();
      }
    }

    console.log("--- DEBUG SUCCESS ---");
    res.json({ msg: 'Offer Accepted! Other applications have been withdrawn.' });

  } catch (err) {
    console.error("DEBUG ERROR:", err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;