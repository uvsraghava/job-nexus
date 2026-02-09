const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // UPDATED: Connected to 'job_portal_db' based on your Compass screenshot
    await mongoose.connect('mongodb://127.0.0.1:27017/job_portal_db');
    console.log('Local MongoDB (job_portal_db) Connected Successfully');
  } catch (err) {
    console.error('MongoDB Connection Failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;