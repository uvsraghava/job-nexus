const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'recruiter', 'faculty'],
    required: true
  },
  // --- NEW FIELD: Approval Status ---
  isApproved: {
    type: Boolean,
    default: function() {
      // Logic: Recruiters & Faculty are auto-approved (true)
      // Students need approval (false)
      if (this.role === 'recruiter' || this.role === 'faculty') {
        return true;
      }
      return false; // Students default to false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);