import express from 'express';
import Issue from '../models/Issue.js';
import Project from '../models/Project.js';
import Comment from '../models/Comment.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

const canAccessProject = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return null;
  const isMember =
    project.createdBy.toString() === userId.toString() ||
    project.members.some((m) => m.toString() === userId.toString());
  return isMember ? project : null;
};

const isProjectMember = (project, userId) => {
  const creatorId = String(project.createdBy?._id || project.createdBy);
  const memberIds = (project.members || []).map((m) => String(m?._id || m));
  return creatorId === String(userId) || memberIds.includes(String(userId));
};

// List all issues user has access to, or issues within a specific project
router.get('/', async (req, res) => {
  try {
    const { project, projectId, status, priority, assignee, search, type } = req.query;
    const actualProjectId = project || projectId;
    
    // If no project specified, get all issues user has access to
    if (!actualProjectId) {
      // Get all projects user has access to
      const userProjects = await Project.find({
        $or: [
          { createdBy: req.user._id },
          { members: req.user._id }
        ]
      });
      
      const projectIds = userProjects.map(p => p._id);
      
      const filter = { project: { $in: projectIds } };
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (assignee) {
        if (assignee === 'unassigned') {
          filter.assignee = null;
        } else {
          filter.assignee = assignee;
        }
      }
      if (type) filter.type = type;
      if (search?.trim()) {
        filter.$or = [
          { title: new RegExp(search.trim(), 'i') },
          { description: new RegExp(search.trim(), 'i') },
        ];
      }

      const issues = await Issue.find(filter)
        .populate('createdBy', 'name email')
        .populate('assignee', 'name email')
        .populate('project', 'name')
        .sort({ updatedAt: -1 });
      
      return res.json(issues);
    }
    
    // Project-specific logic
    const projectData = await canAccessProject(actualProjectId, req.user._id);
    if (!projectData) return res.status(403).json({ message: 'Access denied' });

    const filter = { project: actualProjectId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;
    if (type) filter.type = type;
    if (search?.trim()) {
      filter.$or = [
        { title: new RegExp(search.trim(), 'i') },
        { description: new RegExp(search.trim(), 'i') },
      ];
    }

    const issues = await Issue.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignee', 'name email')
      .populate('project', 'name')
      .sort({ order: 1, createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List issues assigned to the current user across projects
router.get('/assigned', async (req, res) => {
  try {
    const { status, priority, search, page = 1, limit = 20, sort = '-updatedAt' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const lim = Math.min(100, parseInt(limit, 10) || 20);

    const filter = { assignee: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search?.trim()) {
      filter.$or = [
        { title: new RegExp(search.trim(), 'i') },
        { description: new RegExp(search.trim(), 'i') },
      ];
    }

    const total = await Issue.countDocuments(filter);
    const issues = await Issue.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignee', 'name email')
      .populate('project', 'name')
      .sort(sort)
      .skip((pageNum - 1) * lim)
      .limit(lim);

    res.json({ total, page: pageNum, limit: lim, issues });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List issues created by the current user across projects
router.get('/created', async (req, res) => {
  try {
    const { status, priority, search, page = 1, limit = 20, sort = '-updatedAt' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const lim = Math.min(100, parseInt(limit, 10) || 20);

    const filter = { createdBy: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search?.trim()) {
      filter.$or = [
        { title: new RegExp(search.trim(), 'i') },
        { description: new RegExp(search.trim(), 'i') },
      ];
    }

    const total = await Issue.countDocuments(filter);
    const issues = await Issue.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignee', 'name email')
      .populate('project', 'name')
      .sort(sort)
      .skip((pageNum - 1) * lim)
      .limit(lim);

    res.json({ total, page: pageNum, limit: lim, issues });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new issue
router.post('/', async (req, res) => {
  try {
    const { project: projectId, assignee, status = 'open', ...data } = req.body;
    if (!projectId) return res.status(400).json({ message: 'project required' });
    
    const project = await canAccessProject(projectId, req.user._id);
    if (!project) return res.status(403).json({ message: 'Access denied' });
    
    if (assignee && !isProjectMember(project, assignee)) {
      return res.status(400).json({ message: 'Assignee must be a project member' });
    }

    // Determine order within the given status (append to end)
    const maxOrder = await Issue.findOne({ project: projectId, status }).sort({ order: -1 });
    const issue = await Issue.create({
      ...data,
      project: projectId,
      createdBy: req.user._id,
      assignee: assignee || null,
      status,
      order: (maxOrder?.order ?? -1) + 1,
    });
    
    await issue.populate(['createdBy', 'assignee', 'project']);
    res.status(201).json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific issue
router.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignee', 'name email')
      .populate('project', 'name');
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    
    const projectId = issue.project?._id || issue.project;
    const project = await canAccessProject(projectId, req.user._id);
    if (!project) return res.status(403).json({ message: 'Access denied' });
    
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update an issue (PUT)
router.put('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    
    const project = await canAccessProject(issue.project, req.user._id);
    if (!project) return res.status(403).json({ message: 'Access denied' });
    
    if (req.body.assignee && req.body.assignee !== '') {
      if (!isProjectMember(project, req.body.assignee)) {
        return res.status(400).json({ message: 'Assignee must be a project member' });
      }
    }
    
    Object.assign(issue, req.body);
    await issue.save();
    await issue.populate(['createdBy', 'assignee', 'project']);
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update an issue (PATCH)
router.patch('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    
    const project = await canAccessProject(issue.project, req.user._id);
    if (!project) return res.status(403).json({ message: 'Access denied' });
    
    if (req.body.assignee && req.body.assignee !== '') {
      if (!isProjectMember(project, req.body.assignee)) {
        return res.status(400).json({ message: 'Assignee must be a project member' });
      }
    }
    
    Object.assign(issue, req.body);
    await issue.save();
    await issue.populate(['createdBy', 'assignee', 'project']);
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reorder issues (for Kanban)
router.patch('/:id/reorder', async (req, res) => {
  try {
    const { status: newStatusRaw, order: newOrderRaw } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    
    const project = await canAccessProject(issue.project, req.user._id);
    if (!project) return res.status(403).json({ message: 'Access denied' });

    const projectId = String(issue.project);
    const oldStatus = issue.status;
    const oldOrder = typeof issue.order === 'number' ? issue.order : 0;
    const newStatus = newStatusRaw || oldStatus;

    // If newOrder not provided, append to end of dest column
    let newOrder = typeof newOrderRaw === 'number' ? newOrderRaw : null;
    if (newOrder === null) {
      const maxDest = await Issue.findOne({ project: projectId, status: newStatus }).sort({ order: -1 });
      newOrder = (maxDest?.order ?? -1) + 1;
    }

    if (newStatus === oldStatus) {
      // Move within same column
      if (newOrder > oldOrder) {
        await Issue.updateMany(
          { project: projectId, status: oldStatus, order: { $gt: oldOrder, $lte: newOrder } },
          { $inc: { order: -1 } }
        );
      } else if (newOrder < oldOrder) {
        await Issue.updateMany(
          { project: projectId, status: oldStatus, order: { $gte: newOrder, $lt: oldOrder } },
          { $inc: { order: 1 } }
        );
      }
    } else {
      // Moving between columns
      await Issue.updateMany(
        { project: projectId, status: oldStatus, order: { $gt: oldOrder } },
        { $inc: { order: -1 } }
      );
      await Issue.updateMany(
        { project: projectId, status: newStatus, order: { $gte: newOrder } },
        { $inc: { order: 1 } }
      );
    }

    issue.status = newStatus;
    issue.order = newOrder;
    await issue.save();
    await issue.populate(['createdBy', 'assignee', 'project']);
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete an issue
router.delete('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    
    const project = await canAccessProject(issue.project, req.user._id);
    if (!project) return res.status(403).json({ message: 'Access denied' });
    
    const isCreator = String(issue.createdBy) === String(req.user._id);
    const isOwner = String(project.createdBy?._id || project.createdBy) === String(req.user._id);
    if (!isCreator && !isOwner) {
      return res.status(403).json({ message: 'Only the ticket creator or project owner can delete' });
    }
    
    await issue.deleteOne();
    res.json({ message: 'Issue deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get comments for an issue
router.get('/:id/comments', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    
    const project = await canAccessProject(issue.project, req.user._id);
    if (!project) return res.status(403).json({ message: 'Access denied' });
    
    const comments = await Comment.find({ issue: req.params.id })
      .populate('author', 'name email')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add comment to an issue
router.post('/:id/comments', async (req, res) => {
  try {
    const { content } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    
    const project = await canAccessProject(issue.project, req.user._id);
    if (!project) return res.status(403).json({ message: 'Access denied' });
    
    const comment = await Comment.create({
      content,
      issue: req.params.id,
      author: req.user._id
    });
    
    await comment.populate('author', 'name email');
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;