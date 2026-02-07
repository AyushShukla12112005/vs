import express from 'express';
import Project from '../models/Project.js';
import Issue from '../models/Issue.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's projects
    const projects = await Project.find({
      $or: [{ createdBy: userId }, { members: userId }],
    });
    
    const projectIds = projects.map(p => p._id);
    
    // Get all issues for user's projects
    const allIssues = await Issue.find({
      project: { $in: projectIds }
    }).populate('project', 'name');
    
    // Calculate statistics
    const stats = {
      totalProjects: projects.length,
      completedProjects: 0,
      myTasks: allIssues.filter(issue => 
        issue.assignee?.toString() === userId.toString()
      ).length,
      overdue: allIssues.filter(issue => {
        if (!issue.dueDate) return false;
        return new Date(issue.dueDate) < new Date() && issue.status !== 'done';
      }).length,
      inProgress: allIssues.filter(issue => issue.status === 'in_progress').length,
      totalIssues: allIssues.length
    };
    
    // Calculate completed projects
    for (const project of projects) {
      const projectIssues = allIssues.filter(issue => 
        issue.project._id.toString() === project._id.toString()
      );
      if (projectIssues.length > 0 && projectIssues.every(issue => issue.status === 'done')) {
        stats.completedProjects++;
      }
    }
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch statistics' });
  }
});

// Get recent activity
router.get('/activity', async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's projects
    const projects = await Project.find({
      $or: [{ createdBy: userId }, { members: userId }],
    });
    
    const projectIds = projects.map(p => p._id);
    
    // Get recent issues
    const recentIssues = await Issue.find({
      project: { $in: projectIds }
    })
      .populate('project', 'name')
      .populate('assignee', 'name')
      .populate('createdBy', 'name')
      .sort({ updatedAt: -1 })
      .limit(10);
    
    res.json(recentIssues);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch activity' });
  }
});

router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ createdBy: req.user._id }, { members: req.user._id }],
    })
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .sort({ updatedAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const project = await Project.create({
      ...req.body,
      createdBy: req.user._id,
      members: [req.user._id, ...(req.body.members || [])],
    });
    await project.populate(['createdBy', 'members']);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const creatorId = String(project.createdBy?._id || project.createdBy);
    const memberIds = (project.members || []).map((m) => String(m?._id || m));
    const isMember = creatorId === String(req.user._id) || memberIds.includes(String(req.user._id));
    if (!isMember) return res.status(403).json({ message: 'Access denied' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const isOwner = project.createdBy.toString() === req.user._id.toString();
    const isMember =
      isOwner || project.members.some((m) => m.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access denied' });
    if (req.body.members !== undefined && !isOwner) {
      return res.status(403).json({ message: 'Only owner can manage members' });
    }
    Object.assign(project, req.body);
    await project.save();
    await project.populate(['createdBy', 'members']);
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/invite', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can invite' });
    }
    
    const { userId, email } = req.body;
    let userToInvite;
    
    // Support both userId and email
    if (email) {
      const User = (await import('../models/User.js')).default;
      userToInvite = await User.findOne({ email: email.toLowerCase() });
      if (!userToInvite) {
        return res.status(404).json({ message: 'User with this email not found' });
      }
    } else if (userId) {
      userToInvite = { _id: userId };
    } else {
      return res.status(400).json({ message: 'userId or email required' });
    }
    
    const alreadyMember = project.members.some((m) => String(m) === String(userToInvite._id));
    if (alreadyMember) {
      return res.status(400).json({ message: 'User already in project' });
    }
    
    project.members.push(userToInvite._id);
    await project.save();
    await project.populate(['createdBy', 'members']);
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can update project' });
    }
    
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    
    await project.save();
    await project.populate(['createdBy', 'members']);
    
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can delete project' });
    }
    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
