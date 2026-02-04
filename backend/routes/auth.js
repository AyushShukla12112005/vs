import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/emailService.js';

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password });
    
    // Send welcome email (don't block registration if email fails)
    sendWelcomeEmail(email, name).catch(err => 
      console.error('Failed to send welcome email:', err.message)
    );
    
    res.status(201).json({
      user: user.toJSON(),
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({
      user: user.toJSON(),
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Login failed' });
  }
});

router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide email address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, resetToken, req);
    
    // Always log for development
    const resetUrl = `${req.protocol}://${req.get('host').replace(':5002', ':3001')}/reset-password?token=${resetToken}`;
    console.log(`Password reset link for ${email}: ${resetUrl}`);
    
    if (!emailResult.success) {
      console.error('Failed to send reset email:', emailResult.error);
    }

    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.',
      // In development, include the token for testing
      ...(process.env.NODE_ENV === 'development' && { resetToken, resetUrl })
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to process password reset request' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Please provide reset token and new password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password and clear reset token
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to reset password' });
  }
});

// Get reset tokens (admin only - for development)
router.get('/reset-tokens', protect, async (req, res) => {
  try {
    const users = await User.find({ resetToken: { $exists: true } })
      .select('name email resetToken resetTokenExpiry');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Profile
router.patch('/profile', protect, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true }
    ).select('-password');

    res.json({ user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Change Password
router.patch('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
