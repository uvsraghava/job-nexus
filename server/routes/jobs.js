const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User'); 
const authMiddleware = require('../middleware/auth'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// --- ROUTES ---

// 1. Post Job
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ msg: 'Access denied' });
  try {
    const job = new Job({ ...req.body, recruiterId: req.user.userId || req.user.id });
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
    const jobs = await Job.find().sort({ postedAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// 3. Apply
router.post('/:id/apply', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    const studentId = req.user.userId || req.user.id || req.user._id;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    const alreadyApplied = job.applicants.some(app => app.studentId && app.studentId.toString() === studentId);
    if (alreadyApplied) return res.status(400).json({ msg: 'You have already applied' });

    const student = await User.findById(studentId);
    job.applicants.push({
      studentId: studentId,
      name: student.name, 
      email: student.email,
      resume: req.file ? req.file.path : null,
      status: 'Pending'
    });
    await job.save();
    res.json({ msg: 'Application successful' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// 4. Recruiter Jobs
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

// 5. Update Status (Unrestricted)
router.put('/:id/application/:studentId', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body; 
    const { id, studentId } = req.params;

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    const applicant = job.applicants.find(app => app.studentId.toString() === studentId);
    if (!applicant) return res.status(404).json({ msg: 'Applicant not found' });

    applicant.status = status;
    await job.save();
    res.json({ msg: `Status updated to ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// 6. Delete Job
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ msg: 'Access denied' });
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    const recruiterId = req.user.userId || req.user.id || req.user._id;
    if (job.recruiterId.toString() !== recruiterId) return res.status(403).json({ msg: 'Not authorized' });

    await job.deleteOne();
    res.json({ msg: 'Job removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// 7. Withdraw
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

// 8. ACCEPT OFFER (DEBUG VERSION)
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
    // We use .toString() to ensure ObjectId vs String match works
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