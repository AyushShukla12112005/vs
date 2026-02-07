import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from '../config/db.js';
import authRoutes from '../routes/auth.js';
import projectRoutes from '../routes/projects.js';
import issueRoutes from '../routes/issues.js';
import commentRoutes from '../routes/comments.js';
import userRoutes from '../routes/users.js';
import adminRoutes from '../routes/admin.js';

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Initialize database connection (cached by Vercel)
let dbConnected = false;
async function initDB() {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bug Tracker API',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      projects: '/api/projects',
      issues: '/api/issues'
    }
  });
});

// Vercel serverless function handler
export default async function handler(req, res) {
  try {
    // Initialize DB on first request
    await initDB();
    
    // Handle the request with Express
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
}
