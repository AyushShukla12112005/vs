import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import Modal from './Modal';

export default function Sidebar({ open, onClose, collapsed = false, onToggleCollapse }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [invitingProject, setInvitingProject] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      console.log('Loading projects...');
      const response = await api.get('/projects');
      console.log('Projects response:', response.data);
      setProjects(response.data || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
      console.error('Error details:', error.response?.data);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) {
      addToast('Project name is required', { type: 'error' });
      return;
    }

    try {
      setCreating(true);
      const response = await api.post('/projects', {
        name: projectName.trim(),
        description: projectDescription.trim()
      });
      
      setProjects(prev => [...prev, response.data]);
      addToast('Project created successfully', { type: 'success' });
      setShowCreateModal(false);
      setProjectName('');
      setProjectDescription('');
      
      // Navigate to the new project
      navigate(`/project/${response.data._id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      addToast(error.response?.data?.message || 'Failed to create project', { type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) {
      addToast('Project name is required', { type: 'error' });
      return;
    }

    try {
      setUpdating(true);
      const response = await api.put(`/projects/${editingProject._id}`, {
        name: projectName.trim(),
        description: projectDescription.trim()
      });
      
      setProjects(prev => prev.map(p => p._id === editingProject._id ? response.data : p));
      addToast('Project updated successfully', { type: 'success' });
      setShowEditModal(false);
      setEditingProject(null);
      setProjectName('');
      setProjectDescription('');
    } catch (error) {
      console.error('Failed to update project:', error);
      addToast(error.response?.data?.message || 'Failed to update project', { type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (!window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(prev => prev.filter(p => p._id !== projectId));
      addToast('Project deleted successfully', { type: 'success' });
      
      // If currently viewing this project, navigate to dashboard
      if (location.pathname.includes(projectId)) {
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      addToast(error.response?.data?.message || 'Failed to delete project', { type: 'error' });
    }
  };

  const openEditModal = (project, e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProject(project);
    setProjectName(project.name);
    setProjectDescription(project.description || '');
    setShowEditModal(true);
  };

  const openInviteModal = (project, e) => {
    e.preventDefault();
    e.stopPropagation();
    setInvitingProject(project);
    setInviteEmail('');
    setShowInviteModal(true);
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      addToast('Email is required', { type: 'error' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      addToast('Please enter a valid email address', { type: 'error' });
      return;
    }

    try {
      setInviting(true);
      await api.post(`/projects/${invitingProject._id}/invite`, {
        email: inviteEmail.trim()
      });
      
      addToast('Invitation sent successfully', { type: 'success' });
      setShowInviteModal(false);
      setInvitingProject(null);
      setInviteEmail('');
      loadProjects(); // Refresh to show updated member list
    } catch (error) {
      console.error('Failed to invite member:', error);
      addToast(error.response?.data?.message || 'Failed to send invitation', { type: 'error' });
    } finally {
      setInviting(false);
    }
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'All Tickets',
      path: '/tickets',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      name: 'Kanban Board',
      path: '/kanban',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0v10" />
        </svg>
      ),
    },
    {
      name: 'My Tasks',
      path: '/my-tasks',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  // Mobile overlay
  if (open && typeof window !== 'undefined' && window.innerWidth < 768) {
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={onClose} />
        <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl md:hidden">
          <SidebarContent
            navigationItems={navigationItems}
            projects={projects}
            loading={loading}
            user={user}
            isActive={isActive}
            onClose={onClose}
            collapsed={false}
            onToggleCollapse={onToggleCollapse}
            navigate={navigate}
            setShowCreateModal={setShowCreateModal}
            handleDeleteProject={handleDeleteProject}
            openEditModal={openEditModal}
            openInviteModal={openInviteModal}
          />
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div className={`hidden md:flex fixed inset-y-0 left-0 z-30 ${collapsed ? 'w-16' : 'w-72'} bg-white border-r border-gray-200 shadow-sm transition-all duration-300`}>
      <SidebarContent
        navigationItems={navigationItems}
        projects={projects}
        loading={loading}
        user={user}
        isActive={isActive}
        onClose={onClose}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        navigate={navigate}
        setShowCreateModal={setShowCreateModal}
        handleDeleteProject={handleDeleteProject}
        openEditModal={openEditModal}
        openInviteModal={openInviteModal}
      />

      {/* Create Project Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Project">
        <form onSubmit={handleCreateProject}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project name"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project description"
              rows="3"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Project Modal */}
      <Modal open={showEditModal} onClose={() => { setShowEditModal(false); setEditingProject(null); setProjectName(''); setProjectDescription(''); }} title="Edit Project">
        <form onSubmit={handleEditProject}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project name"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project description"
              rows="3"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => { setShowEditModal(false); setEditingProject(null); setProjectName(''); setProjectDescription(''); }}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Update Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Invite Member Modal */}
      <Modal open={showInviteModal} onClose={() => { setShowInviteModal(false); setInvitingProject(null); setInviteEmail(''); }} title={`Invite Member to ${invitingProject?.name || 'Project'}`}>
        <form onSubmit={handleInviteMember}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter member's email"
              required
            />
            <p className="mt-2 text-xs text-gray-500">
              An invitation will be sent to this email address
            </p>
          </div>
          {invitingProject && invitingProject.members && invitingProject.members.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Members ({invitingProject.members.length})
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {invitingProject.members.map((member) => (
                  <div key={member._id} className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                      {member.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span>{member.name}</span>
                    <span className="text-gray-400">({member.email})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => { setShowInviteModal(false); setInvitingProject(null); setInviteEmail(''); }}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={inviting}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {inviting ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function SidebarContent({ navigationItems, projects, loading, user, isActive, onClose, collapsed, onToggleCollapse, navigate, setShowCreateModal, handleDeleteProject, openEditModal, openInviteModal }) {
  if (collapsed) {
    return (
      <div className="flex flex-col h-full w-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">BT</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => onClose?.()}
              className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={item.name}
            >
              {item.icon}
            </Link>
          ))}
        </nav>

        {/* Expand button */}
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={onToggleCollapse}
            className="w-full p-2 rounded-lg hover:bg-gray-50 text-gray-600"
            title="Expand sidebar"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">BT</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Bug Tracker</h1>
            <p className="text-xs text-gray-500">Project Management</p>
          </div>
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded hover:bg-gray-50 text-gray-400 hidden md:block"
            title="Collapse sidebar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => onClose?.()}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-600 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Projects Section */}
        <div className="pt-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Projects</h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
              title="Create new project"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <div className="space-y-1">
            {loading ? (
              <div className="px-4 py-2 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  <span>Loading...</span>
                </div>
              </div>
            ) : projects.length === 0 ? (
              <div className="px-4 py-3">
                <p className="text-sm text-gray-500 mb-2">No projects yet</p>
                <p className="text-xs text-gray-400 mb-2">Debug: {JSON.stringify({ loading, count: projects.length })}</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Create your first project
                </button>
              </div>
            ) : (
              <>
                {projects.slice(0, 5).map((project) => (
                  <div
                    key={project._id}
                    className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <Link
                      to={`/project/${project._id}`}
                      onClick={() => onClose?.()}
                      className="flex items-center space-x-3 flex-1 min-w-0"
                    >
                      <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-700 truncate group-hover:text-gray-900">{project.name}</span>
                    </Link>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => openInviteModal(project, e)}
                        className="p-1.5 rounded hover:bg-green-100 text-gray-400 hover:text-green-600 transition-colors"
                        title="Invite member"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => openEditModal(project, e)}
                        className="p-1.5 rounded hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit project"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteProject(project._id, project.name); }}
                        className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete project"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                {projects.length > 5 && (
                  <button
                    onClick={() => navigate('/')}
                    className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg text-left transition-colors"
                  >
                    View all {projects.length} projects →
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-medium text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
