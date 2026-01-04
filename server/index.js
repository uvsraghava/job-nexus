const path = require('path');
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

// 1. CREATE APP HERE (This was missing or too low)
const app = express();

// 2. Connect Database
connectDB();

// 3. Middleware
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL }));

// 4. Import Routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');   // <-- Ensure this file has module.exports = router
const adminRoutes = require('./routes/admin');

// DEBUG (Optional - you can remove this later)
console.log('Job Routes Status:', jobRoutes); 

// 5. Define Routes (Now 'app' exists, so this works)
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);
// Allow the browser to access files in the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));