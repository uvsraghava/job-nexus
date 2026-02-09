require('dotenv').config(); // Load Environment Variables FIRST
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path'); 

const app = express();

// 1. CONNECT DATABASE
connectDB(); 

// 2. MIDDLEWARE
app.use(cors({
  // [FIX] Allow requests from ANYWHERE (Vercel, Localhost, etc.)
  origin: '*', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ extended: false }));

// Make Uploads Folder Public (Optional now that we use Cloudinary, but good to keep)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. DEBUG LOGGER
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// 4. ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs')); 

// 5. START SERVER
// [FIX] Use Render's assigned Port (process.env.PORT)
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`>>> Server started on port ${PORT}`));