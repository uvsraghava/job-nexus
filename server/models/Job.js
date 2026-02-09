const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
    default: 'Full-time'
  },
  
  // --- FAIR PLAY POLICY ---
  jobPolicy: {
    type: String,
    enum: ['Exclusive', 'Open'],
    default: 'Exclusive' 
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
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      email: String,
      resume: String, // Stores local path (e.g. "uploads/resume.pdf")
      status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'Confirmed', 'Withdrawn (System)', 'Interview Scheduled'],
        default: 'Pending'
      },
      
      // --- NEW AI FIELDS (Must be here to save scores) ---
      aiScore: { type: Number, default: null },     // Stores 0-100
      aiFeedback: { type: String, default: null },  // Stores the "Why"

      feedback: { type: String, default: '' },
      interviewDate: { type: Date },
      interviewLink: { type: String },
      appliedAt: { type: Date, default: Date.now }
    }
  ],
  postedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', JobSchema);