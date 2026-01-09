const path = require('path');
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

// 1. CREATE APP
const app = express();

// 2. Connect Database
connectDB();

// 3. Middleware (UPDATED CORS)
app.use(express.json());
app.use(cors({ 
  origin: [
    "http://localhost:3000",                // For local development
    "https://jobnexus-try.vercel.app",      // Your LIVE Frontend
    "https://jobnexus-try.vercel.app/"      // Trailing slash version (safety)
  ],
  credentials: true 
}));

// 4. Import Routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');   
const adminRoutes = require('./routes/admin');

// 5. Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);

// (Optional) Static folder - mostly replaced by Cloudinary now, but safe to keep
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));