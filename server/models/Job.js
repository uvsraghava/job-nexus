const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  salary: {
    type: String, // Stored as string to allow "15 LPA" etc.
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
    default: 'Full-time'
  },
  
  // --- JOB APPROVAL STATUS ---
  status: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'pending' 
  },

  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicants: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String,
      email: String,
      resume: String, // Path to file
      status: {
        type: String,
        // --- UPDATED ENUM LIST ---
        // Added 'Interview Scheduled'
        enum: ['Pending', 'Accepted', 'Rejected', 'Confirmed', 'Withdrawn (System)', 'Interview Scheduled'],
        default: 'Pending'
      },
      
      // --- FEEDBACK & INTERVIEW FIELDS ---
      feedback: {
        type: String,
        default: ''
      },
      interviewDate: {
        type: Date
      },
      interviewLink: {
        type: String
      },

      appliedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  postedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Job', JobSchema);