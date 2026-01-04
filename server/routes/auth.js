const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// --- REGISTER USER ---
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      role
      // isApproved defaults handled by Model
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create Token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      'your_jwt_secret',
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: { id: user.id, name: user.name, role: user.role, isApproved: user.isApproved } 
        });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// --- LOGIN USER ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // --- GATEKEEPER CHECK ---
    // Fix: strict check. If it's NOT true, block them.
    if (user.role === 'student' && user.isApproved !== true) {
      return res.status(403).json({ 
        msg: 'Account pending approval. Please contact your Faculty coordinator.' 
      });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      'your_jwt_secret',
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: { id: user.id, name: user.name, role: user.role } 
        });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// --- GET PENDING STUDENTS (Fixed for Legacy Users) ---
router.get('/pending-students', authMiddleware, async (req, res) => {
  if (req.user.role !== 'faculty') return res.status(403).json({ msg: 'Access denied' });

  try {
    // FIX: Using $ne: true catches 'false' AND 'undefined'
    const students = await User.find({ 
      role: 'student', 
      isApproved: { $ne: true } 
    }).select('-password');
    
    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// --- APPROVE A STUDENT ---
router.put('/approve-student/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'faculty') return res.status(403).json({ msg: 'Access denied' });

  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ msg: 'Student not found' });

    student.isApproved = true;
    await student.save();

    res.json({ msg: 'Student Approved Successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// --- UPDATE PROFILE ---
router.put('/update-profile', authMiddleware, async (req, res) => {
  try {
    const { name, password } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (name) user.name = name;

    if (password && password.length > 0) {
      if (password.length < 6) return res.status(400).json({ msg: 'Password must be 6+ chars' });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    
    res.json({ id: user.id, name: user.name, role: user.role });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;