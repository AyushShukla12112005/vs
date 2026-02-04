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
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
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
    </div>
  );
}

function SidebarContent({ navigationItems, projects, loading, user, isActive, onClose, collapsed, onToggleCollapse, navigate, setShowCreateModal }) {
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
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600"
              title="Create new project"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <div className="space-y-1">
            {loading ? (
              <div className="px-4 py-2 text-sm text-gray-500">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">No projects yet</div>
            ) : (
              projects.slice(0, 5).map((project) => (
                <Link
                  key={project._id}
                  to={`/project/${project._id}`}
                  onClick={() => onClose?.()}
                  className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-700 truncate">{project.name}</span>
                </Link>
              ))
            )}
            {projects.length > 5 && (
              <button
                onClick={() => navigate('/')}
                className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg text-left"
              >
                View all projects →
              </button>
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
