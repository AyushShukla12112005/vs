import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get all users with active reset tokens (development only)
router.get('/reset-tokens', async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Admin routes not available in production' });
    }

    const users = await User.find({
      resetToken: { $exists: true, $ne: null },
      resetTokenExpiry: { $exists: true, $ne: null }
    }).select('name email resetToken resetTokenExpiry updatedAt');

    res.json({
      tokens: users.map(user => ({
        name: user.name,
        email: user.email,
        resetToken: user.resetToken,
        resetTokenExpiry: user.resetTokenExpiry,
        updatedAt: user.updatedAt
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch reset tokens' });
  }
});

// Clear all reset tokens (development only)
router.delete('/reset-tokens', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Admin routes not available in production' });
    }

    await User.updateMany(
      { resetToken: { $exists: true } },
      { $unset: { resetToken: 1, resetTokenExpiry: 1 } }
    );

    res.json({ message: 'All reset tokens cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to clear reset tokens' });
  }
});

// Get all users (development only)
router.get('/users', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Admin routes not available in production' });
    }

    const users = await User.find().select('-password');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch users' });
  }
});

export default router;