// [CRITICAL FIX] Load Environment Variables FIRST
require('dotenv').config(); 

const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path'); 

const app = express();

// 1. CONNECT DATABASE
connectDB(); 

// 2. MIDDLEWARE
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ extended: false }));

// Make Uploads Folder Public
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
const PORT = 8000;
app.listen(PORT, () => console.log(`>>> Local Server started on port ${PORT}`));