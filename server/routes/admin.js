const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const User = require('../models/User');

// GET PENDING USERS
router.get('/pending-users', auth, checkRole(['faculty']), async (req, res) => {
  try {
    const users = await User.find({ isVerified: false }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// APPROVE USER
router.put('/verify/:id', auth, checkRole(['faculty']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.isVerified = true;
    await user.save();
    res.json({ msg: 'User verified successfully' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;