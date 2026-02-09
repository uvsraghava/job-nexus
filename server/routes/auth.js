const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// [NEW] Cloudinary Imports
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { analyzeResume } = require('../utils/ai'); 

// --- CLOUDINARY CONFIG ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'resumes', // Folder name in Cloudinary Dashboard
    allowed_formats: ['pdf'],
    resource_type: 'raw' // Important: Keeps PDF format intact
  },
});

const upload = multer({ storage: storage });

// --- ROUTES ---

// REGISTER USER
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });
    user = new User({ name, email, password, role });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, role: user.role, isApproved: user.isApproved } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// LOGIN USER
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });
    if (user.role === 'student' && user.isApproved !== true) {
      return res.status(403).json({ msg: 'Account pending. Please wait for Faculty verification.' });
    }
    if (user.role === 'faculty' && user.email !== 'drssm@gmail.com' && user.isApproved !== true) {
      return res.status(403).json({ msg: 'Access Restricted. Pending Master Admin approval.' });
    }
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// UPLOAD & SCORE RESUME (UPDATED FOR CLOUDINARY)
router.post('/upload-resume', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
    
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // [UPDATED] Cloudinary returns the public URL in req.file.path
    const resumeUrl = req.file.path || req.file.secure_url; 

    console.log(`[Resume Upload] New Cloudinary URL: ${resumeUrl}`);

    // Pass the URL to AI (it now handles URLs via axios)
    const analysis = await analyzeResume(resumeUrl, "General Software Engineering Resume Review");

    user.resume = resumeUrl;
    user.resumeScore = analysis.score;
    user.resumeFeedback = analysis.reason;
    await user.save();

    res.json({ 
      msg: 'Resume scored successfully', 
      resume: resumeUrl,
      score: analysis.score,
      feedback: analysis.reason
    });

  } catch (err) {
    console.error("Resume Upload Error:", err);
    res.status(500).send('Server Error during resume analysis');
  }
});

// GET PENDING STUDENTS
router.get('/pending-students', authMiddleware, async (req, res) => {
  if (req.user.role !== 'faculty') return res.status(403).json({ msg: 'Access denied' });
  try {
    const students = await User.find({ role: 'student', isApproved: { $ne: true } }).select('-password');
    res.json(students);
  } catch (err) { res.status(500).send('Server error'); }
});

// APPROVE STUDENT
router.put('/approve-student/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'faculty') return res.status(403).json({ msg: 'Access denied' });
  try {
    await User.findByIdAndUpdate(req.params.id, { isApproved: true });
    res.json({ msg: 'Student Approved Successfully' });
  } catch (err) { res.status(500).send('Server error'); }
});

// [NEW] REJECT STUDENT (Faculty Only)
router.delete('/reject-student/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'faculty') return res.status(403).json({ msg: 'Access denied' });
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Student Request Rejected' });
  } catch (err) { 
    console.error(err);
    res.status(500).send('Server error'); 
  }
});

// GET PENDING FACULTY (Master Only)
router.get('/pending-faculty', authMiddleware, async (req, res) => {
  try {
    const requestor = await User.findById(req.user.id);
    if (requestor.email !== 'drssm@gmail.com') return res.status(403).json({ msg: 'Access Denied' });
    const pendingFaculty = await User.find({ role: 'faculty', isApproved: { $ne: true } }).select('-password');
    res.json(pendingFaculty);
  } catch (err) { res.status(500).send('Server error'); }
});

// APPROVE FACULTY (Master Only)
router.put('/approve-faculty/:id', authMiddleware, async (req, res) => {
  try {
    const requestor = await User.findById(req.user.id);
    if (requestor.email !== 'drssm@gmail.com') return res.status(403).json({ msg: 'Access Denied' });
    await User.findByIdAndUpdate(req.params.id, { isApproved: true });
    res.json({ msg: 'Faculty Approved Successfully' });
  } catch (err) { res.status(500).send('Server error'); }
});

// UPDATE PROFILE
router.put('/update-profile', authMiddleware, async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findById(req.user.id);
    if (name) user.name = name;
    if (password && password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    await user.save();
    res.json({ id: user.id, name: user.name, role: user.role });
  } catch (err) { res.status(500).send('Server error'); }
});

// REJECT FACULTY (Master Only)
router.delete('/reject-faculty/:id', authMiddleware, async (req, res) => {
    try {
      const requestor = await User.findById(req.user.id);
      if (requestor.email !== 'drssm@gmail.com') return res.status(403).json({ msg: 'Access Denied' });
      await User.findByIdAndDelete(req.params.id);
      res.json({ msg: 'Faculty Rejected' });
    } catch (err) { res.status(500).send('Server error'); }
});

// GET ALL APPROVED STUDENTS WITH AI SCORES
router.get('/all-students', authMiddleware, async (req, res) => {
    if (req.user.role !== 'faculty') return res.status(403).json({ msg: 'Access denied' });
    try {
      const students = await User.find({ role: 'student', isApproved: true })
        .select('name email resumeScore resumeFeedback resume');
      res.json(students);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error'); 
    }
});

module.exports = router;