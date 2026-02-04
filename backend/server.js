import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import issueRoutes from './routes/issues.js';
import commentRoutes from './routes/comments.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import User from './models/User.js';

const PORT = parseInt(process.env.PORT, 10) || 5000;

if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not set in .env');
  process.exit(1);
}

await connectDB();

// Create default test user for development
async function createDefaultUser() {
  try {
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (!existingUser) {
      const testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('✅ Default test user created: test@example.com / password123');
    }
  } catch (error) {
    console.log('Note: Could not create default user:', error.message);
  }
}

// Create default user after database connection
await createDefaultUser();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

function startServer(port, attempt = 0) {
  const maxAttempts = 10;
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempt < maxAttempts) {
      const nextPort = port + 1;
      console.warn(`Port ${port} in use, trying ${nextPort}...`);
      startServer(nextPort, attempt + 1);
    } else {
      console.error('Server error:', err.message || err);
      process.exit(1);
    }
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer(PORT);
}

export default app;
