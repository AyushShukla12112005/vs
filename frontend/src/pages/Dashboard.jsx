import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Modal from '../components/Modal';

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: '',
    projectLead: '',
    members: []
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    myTasks: 0,
    overdue: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, statsRes, activityRes, usersRes] = await Promise.all([
          api.get('/projects'),
          api.get('/projects/stats'),
          api.get('/projects/activity'),
          api.get('/users')
        ]);
        
        setProjects(projectsRes.data);
        setStats(statsRes.data);
        setUsers(usersRes.data);
        
        const activityData = activityRes.data;
        setIssues(activityData);
        
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Fallback to basic project fetch
        try {
          const [projectsRes, usersRes] = await Promise.all([
            api.get('/projects'),
            api.get('/users').catch(() => ({ data: [] }))
          ]);
          setProjects(projectsRes.data);
          setUsers(usersRes.data);
        } catch (fallbackError) {
          console.error('Failed to fetch projects:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?._id]);

  // Listen for project and issue updates
  useEffect(() => {
    const handleUpdate = () => {
      // Refresh dashboard data when projects or issues are updated
      const fetchData = async () => {
        try {
          const [projectsRes, statsRes, activityRes] = await Promise.all([
            api.get('/projects'),
            api.get('/projects/stats').catch(() => ({ data: stats })),
            api.get('/projects/activity').catch(() => ({ data: issues }))
          ]);
          
          setProjects(projectsRes.data);
          setStats(statsRes.data);
          setIssues(activityRes.data);
        } catch (error) {
          console.error('Failed to refresh dashboard:', error);
        }
      };
      fetchData();
    };

    const handleStorageEvent = (event) => {
      if (event.key === 'issue:created' || event.key === 'issue:updated' || event.key === 'project:created') {
        handleUpdate();
      }
    };

    window.addEventListener('issue:created', handleUpdate);
    window.addEventListener('issue:updated', handleUpdate);
    window.addEventListener('project:created', handleUpdate);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener('issue:created', handleUpdate);
      window.removeEventListener('issue:updated', handleUpdate);
      window.removeEventListener('project:created', handleUpdate);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const projectData = {
        ...formData,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        projectLead: formData.projectLead || undefined
      };
      
      const { data } = await api.post('/projects', projectData);
      setProjects((p) => [data, ...p]);
      setStats(prev => ({ ...prev, totalProjects: prev.totalProjects + 1 }));
      
      // Emit event for other components
      try {
        window.dispatchEvent(new CustomEvent('project:created', { detail: data }));
        localStorage.setItem('project:created', JSON.stringify({ id: data._id, t: Date.now() }));
        setTimeout(() => localStorage.removeItem('project:created'), 1000);
      } catch (e) {
        // ignore if CustomEvent unsupported
      }
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        startDate: '',
        endDate: '',
        projectLead: '',
        members: []
      });
      setShowCreate(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const recentActivity = issues
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  const myTasks = issues
    .filter(issue => issue.assignee?._id === user?._id || issue.assignee === user?._id)
    .slice(0, 5);

  const overdueTasks = issues
    .filter(issue => {
      if (!issue.dueDate) return false;
      return new Date(issue.dueDate) < new Date() && issue.status !== 'done';
    })
    .slice(0, 5);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-surface-500">Here's what's happening with your projects today</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-500">Total Projects</p>
              <p className="text-2xl font-bold text-surface-900">{stats.totalProjects}</p>
              <p className="text-xs text-surface-400 mt-1">Active projects</p>
            </div>
            <div className="w-12 h-12 bg-brand-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-500">Completed Projects</p>
              <p className="text-2xl font-bold text-surface-900">{stats.completedProjects}</p>
              <p className="text-xs text-surface-400 mt-1">All tasks done</p>
            </div>
            <div className="w-12 h-12 bg-success-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-500">My Tasks</p>
              <p className="text-2xl font-bold text-surface-900">{stats.myTasks}</p>
              <p className="text-xs text-surface-400 mt-1">Assigned to me</p>
            </div>
            <div className="w-12 h-12 bg-warning-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 01-2 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-500">Overdue</p>
              <p className="text-2xl font-bold text-surface-900">{stats.overdue}</p>
              <p className="text-xs text-surface-400 mt-1">Past deadline</p>
            </div>
            <div className="w-12 h-12 bg-danger-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Overview */}
        <div className="bg-white rounded-xl shadow-card">
          <div className="p-6 border-b border-surface-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-surface-900">Project Overview</h2>
              <Link to="/" className="text-sm text-brand-500 hover:text-brand-600 font-medium">
                View all
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-surface-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-surface-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-surface-900 mb-2">No projects yet</h3>
                <p className="text-surface-500 mb-4">Create your first project to get started</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="inline-flex items-center px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors"
                >
                  Create your First Project
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-surface-300 scrollbar-track-surface-100">
                {projects.slice(0, 4).map((project) => {
                  const projectIssues = issues.filter(issue => 
                    String(issue.project?._id || issue.project) === String(project._id)
                  );
                  const completedIssues = projectIssues.filter(issue => issue.status === 'done');
                  const progress = projectIssues.length > 0 ? (completedIssues.length / projectIssues.length) * 100 : 0;
                  
                  return (
                    <Link
                      key={project._id}
                      to={`/project/${project._id}`}
                      className="block p-4 rounded-lg border border-surface-200 hover:border-brand-200 hover:bg-brand-50/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-surface-900">{project.name}</h3>
                        <span className="text-xs text-surface-500">
                          {completedIssues.length}/{projectIssues.length} tasks
                        </span>
                      </div>
                      <div className="w-full bg-surface-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-brand-500 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-surface-500 truncate mb-3">{project.description}</p>
                      
                      {/* Project Tickets */}
                      <div className="p-3 min-h-16 bg-surface-50 rounded-lg max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-surface-300 scrollbar-track-surface-100">
                        {projectIssues.length === 0 ? (
                          <div className="text-center py-2 text-zinc-500 italic text-sm">
                            No tickets yet
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {projectIssues.slice(0, 3).map((issue) => (
                              <div
                                key={issue._id}
                                className="p-2 bg-zinc-700 text-white rounded-lg shadow-sm flex items-center justify-between transform transition-all duration-200 hover:scale-105 hover:shadow-md"
                              >
                                <div className="flex items-center space-x-2 flex-1">
                                  <span className="text-sm">{issue.type === 'bug' ? '🐛' : issue.type === 'feature' ? '✨' : '📋'}</span>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-white text-sm line-clamp-1">
                                      {issue.title}
                                    </h4>
                                    <div className="flex items-center space-x-2 text-xs">
                                      <span className="text-zinc-300 uppercase">
                                        {issue.type}
                                      </span>
                                      <div 
                                        className={`w-2 h-2 rounded-full ${
                                          issue.priority === 'urgent' ? 'bg-red-500' :
                                          issue.priority === 'high' ? 'bg-orange-500' :
                                          issue.priority === 'medium' ? 'bg-yellow-500' :
                                          'bg-green-500'
                                        }`}
                                        title={`${issue.priority} priority`}
                                      ></div>
                                      <span className="text-zinc-400">
                                        #{issue._id.slice(-6)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-xs text-zinc-400 capitalize">
                                  {issue.status === 'open' ? 'To Do' : 
                                   issue.status === 'in-progress' ? 'In Progress' : 'Done'}
                                </div>
                              </div>
                            ))}
                            {projectIssues.length > 3 && (
                              <div className="text-center text-xs text-surface-500 pt-1">
                                +{projectIssues.length - 3} more tickets
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* My Tasks */}
          <div className="bg-white rounded-xl shadow-card">
            <div className="p-6 border-b border-surface-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-surface-900">My Tasks</h2>
                <span className="bg-brand-50 text-brand-600 text-xs px-2 py-1 rounded-full font-medium">
                  {stats.myTasks}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              {myTasks.length === 0 ? (
                <p className="text-center text-surface-500 py-8">No my tasks</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-surface-300 scrollbar-track-surface-100">
                  {myTasks.map((task) => (
                    <div key={task._id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-surface-50">
                      <div className={`w-2 h-2 rounded-full ${
                        task.priority === 'high' ? 'bg-danger-500' :
                        task.priority === 'medium' ? 'bg-warning-500' : 'bg-surface-300'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-900 truncate">{task.title}</p>
                        <p className="text-xs text-surface-500">{task.project?.name || 'Unknown Project'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Overdue */}
          <div className="bg-white rounded-xl shadow-card">
            <div className="p-6 border-b border-surface-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-surface-900">Overdue</h2>
                <span className="bg-danger-50 text-danger-600 text-xs px-2 py-1 rounded-full font-medium">
                  {stats.overdue}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              {overdueTasks.length === 0 ? (
                <p className="text-center text-surface-500 py-8">No overdue</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-surface-300 scrollbar-track-surface-100">
                  {overdueTasks.map((task) => (
                    <div key={task._id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-surface-50">
                      <div className="w-2 h-2 rounded-full bg-danger-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-900 truncate">{task.title}</p>
                        <p className="text-xs text-surface-500">{task.project?.name || 'Unknown Project'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-xl shadow-card">
        <div className="p-6 border-b border-surface-200">
          <h2 className="text-lg font-semibold text-surface-900">Recent Activity</h2>
        </div>
        
        <div className="p-6">
          {recentActivity.length === 0 ? (
            <p className="text-center text-surface-500 py-8">No recent activity</p>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-surface-300 scrollbar-track-surface-100">
              {recentActivity.map((activity) => (
                <div key={activity._id} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-surface-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-900">
                      <span className="font-medium">{activity.title}</span> was updated
                    </p>
                    <p className="text-xs text-surface-500 mt-1">
                      {new Date(activity.updatedAt).toLocaleDateString()} • {activity.project?.name || 'Unknown Project'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Project">
        <div className="mb-4">
          <p className="text-sm text-surface-500">
            In workspace: <span className="text-brand-500 font-medium">Bug Tracker</span>
          </p>
        </div>
        
        <form onSubmit={handleCreate} className="space-y-6 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-surface-300 scrollbar-track-surface-100">
          {error && (
            <div className="p-3 rounded-lg bg-danger-50 text-danger-700 text-sm">{error}</div>
          )}
          
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Project Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2.5 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
              placeholder="Enter project name"
              required
            />
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm resize-none"
              placeholder="Describe your project"
            />
          </div>
          
          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2.5 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm bg-white"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2.5 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          
          {/* Start Date and End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full px-3 py-2.5 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="w-full px-3 py-2.5 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          
          {/* Project Lead */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Project Lead</label>
            <select
              value={formData.projectLead}
              onChange={(e) => handleInputChange('projectLead', e.target.value)}
              className="w-full px-3 py-2.5 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm bg-white"
            >
              <option value="">No lead</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
          
          {/* Team Members */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Team Members</label>
            <select
              multiple
              value={formData.members}
              onChange={(e) => {
                const selectedMembers = Array.from(e.target.selectedOptions, option => option.value);
                handleInputChange('members', selectedMembers);
              }}
              className="w-full px-3 py-2.5 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm bg-white min-h-[100px]"
            >
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <p className="text-xs text-surface-500 mt-1">Hold Ctrl/Cmd to select multiple members</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-surface-100">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-6 py-2.5 text-surface-700 border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !formData.name.trim()}
              className="px-6 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {creating ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
