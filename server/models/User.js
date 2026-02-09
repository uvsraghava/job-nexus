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
  
  // --- NEW: GLOBAL RESUME FIELDS ---
  // These fields store the student's active resume and its AI quality score.
  resume: {
    type: String, // Stores local path: "uploads/filename.pdf"
    default: null
  },
  resumeScore: {
    type: Number, // 0-100 Score based on resume quality/strength
    default: null
  },
  resumeFeedback: {
    type: String, // One-line summary of WHY the score is what it is
    default: null
  },

  // --- UPDATED FIELD: Approval Status ---
  isApproved: {
    type: Boolean,
    default: function() {
      // 1. Recruiters are auto-approved
      if (this.role === 'recruiter') {
        return true;
      }
      
      // 2. SAFETY NET: Master Faculty Auto-Approve
      if (this.email === 'drssm@gmail.com' || this.role === 'master-admin') {
         return true; 
      }

      // 3. Students AND Faculty default to FALSE (Need Approval)
      return false; 
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);