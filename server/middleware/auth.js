const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
require('dotenv').config(); 

module.exports = async function(req, res, next) {
  // 1. Get Token
  const token = req.header('x-auth-token');

  // 2. Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // 3. Verify Token
  try {
    // [FIX] This MUST match the login route logic
    const secret = process.env.JWT_SECRET || 'your_jwt_secret';
    
    const decoded = jwt.verify(token, secret);

    // --- CRASH PROOF LOGIC ---
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ msg: 'Token valid but user does not exist locally.' });
    }

    req.user = user; 
    next();
  } catch (err) {
    console.error('[Auth Middleware Error]', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};