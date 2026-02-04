import express from 'express';
import Comment from '../models/Comment.js';
import Issue from '../models/Issue.js';
import Project from '../models/Project.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

const canAccessIssue = async (issueId, userId) => {
  const issue = await Issue.findById(issueId).populate('project');
  const projectId = issue?.project?._id || issue?.project;
  if (!projectId) return null;
  const project = await Project.findById(projectId);
  if (!project) return null;
  const isMember =
    String(project.createdBy) === String(userId) ||
    project.members.some((m) => String(m) === String(userId));
  return isMember ? issue : null;
};

router.get('/issue/:issueId', async (req, res) => {
  try {
    const issue = await canAccessIssue(req.params.issueId, req.user._id);
    if (!issue) return res.status(403).json({ message: 'Access denied' });
    const comments = await Comment.find({ issue: req.params.issueId })
      .populate('author', 'name email')
      .populate('parent')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { issue: issueId, content, parent } = req.body;
    if (!issueId || !content?.trim()) {
      return res.status(400).json({ message: 'issue and content required' });
    }
    const issue = await canAccessIssue(issueId, req.user._id);
    if (!issue) return res.status(403).json({ message: 'Access denied' });
    const comment = await Comment.create({
      issue: issueId,
      content: content.trim(),
      author: req.user._id,
      parent: parent || null,
    });
    await comment.populate('author', 'name email');
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    await canAccessIssue(comment.issue.toString(), req.user._id);
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Can only delete your own comment' });
    }
    await Comment.deleteMany({ $or: [{ _id: comment._id }, { parent: comment._id }] });
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
