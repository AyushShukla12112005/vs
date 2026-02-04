import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// Get all users (for project creation)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email')
      .sort({ name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase();
    if (q.length < 2) return res.json([]);
    const users = await User.find({
      $or: [
        { email: new RegExp(q, 'i') },
        { name: new RegExp(q, 'i') },
      ],
    })
      .select('name email')
      .limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
