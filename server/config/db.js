const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

const connectDB = async () => {
  try {
    // [FIX] Prioritize the Cloud DB (Render), fallback to Local (Laptop)
    const db = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/job_portal_db';
    
    await mongoose.connect(db);
    
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('MongoDB Connection Failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;