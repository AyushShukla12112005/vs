import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import EditTicketModal from '../components/EditTicketModal';

export default function Tickets() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  // State
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table');
  const [editingIssue, setEditingIssue] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    project: '',
    status: '',
    priority: '',
    type: '',
    assignee: ''
  });

  // Load data on mount
  useEffect(() => {
    console.log('Tickets page mounted');
    loadInitialData();
  }, []);

  // Reload issues when filters change
  useEffect(() => {
    if (projects.length > 0) {
      console.log('Reloading issues due to filter change');
      loadIssues();
    }
  }, [filters]);

  const loadInitialData = async () => {
    try {
      console.log('Loading initial data...');
      setLoading(true);
      const [projectsRes, usersRes] = await Promise.all([
        api.get('/projects'),
        api.get('/users')
      ]);
      
      console.log('Projects loaded:', projectsRes.data);
      console.log('Users loaded:', usersRes.data);
      
      setProjects(projectsRes.data || []);
      setUsers(usersRes.data || []);
      
      // Load issues after projects are loaded
      await loadIssues();
    } catch (error) {
      console.error('Failed to load data:', error);
      addToast('Failed to load data', { type: 'error' });
    } finally {
      setLoading(false);
      console.log('Initial data loading complete');
    }
  };

  const loadIssues = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.project) params.append('project', filters.project);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.type) params.append('type', filters.type);
      if (filters.assignee) params.append('assignee', filters.assignee);
      if (filters.search) params.append('search', filters.search);

      console.log('Loading issues with params:', params.toString());
      const response = await api.get(`/issues?${params.toString()}`);
      console.log('Issues loaded:', response.data);
      setIssues(response.data || []);
    } catch (error) {
      console.error('Failed to load issues:', error);
      addToast('Failed to load tickets', { type: 'error' });
      setIssues([]);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      project: '',
      status: '',
      priority: '',
      type: '',
      assignee: ''
    });
  };

  const handleEditIssue = (issue) => {
    setEditingIssue(issue);
    setShowEditModal(true);
  };

  const handleIssueUpdated = (updatedIssue) => {
    setIssues(prev => prev.map(issue => 
      issue._id === updatedIssue._id ? updatedIssue : issue
    ));
    setShowEditModal(false);
    setEditingIssue(null);
    addToast('Ticket updated successfully', { type: 'success' });
  };

  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    
    try {
      await api.delete(`/issues/${issueId}`);
      setIssues(prev => prev.filter(issue => issue._id !== issueId));
      addToast('Ticket deleted successfully', { type: 'success' });
    } catch (error) {
      console.error('Failed to delete issue:', error);
      addToast('Failed to delete ticket', { type: 'error' });
    }
  };

  // Utility functions
  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-green-100 text-green-800 border-green-300'
    };
    return colors[priority?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      done: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type) => {
    const icons = {
      bug: '🐛',
      feature: '✨',
      task: '📋'
    };
    return icons[type?.toLowerCase()] || '📝';
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  if (loading) {
    console.log('Tickets page: Loading state');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Tickets</h2>
          <p className="text-gray-500">Please wait...</p>
        </div>
      </div>
    );
  }

  console.log('Tickets page: Rendering with', issues.length, 'issues');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="mr-3 text-3xl">🎫</span>
              All Tickets
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {issues.length} {issues.length === 1 ? 'ticket' : 'tickets'} found
              {activeFiltersCount > 0 && ` • ${activeFiltersCount} ${activeFiltersCount === 1 ? 'filter' : 'filters'} active`}
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Table view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Grid view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            type="text"
            placeholder="🔍 Search tickets..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          
          <select
            value={filters.project}
            onChange={(e) => handleFilterChange('project', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          >
            <option value="">All Priority</option>
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          >
            <option value="">All Types</option>
            <option value="bug">🐛 Bug</option>
            <option value="feature">✨ Feature</option>
            <option value="task">📋 Task</option>
          </select>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {issues.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <div className="text-7xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tickets Found</h3>
            <p className="text-gray-500 mb-6">
              {activeFiltersCount > 0 
                ? 'Try adjusting your filters to see more results' 
                : projects.length === 0 
                  ? 'Create a project first, then add tickets to it'
                  : 'Create your first ticket to get started'}
            </p>
            {activeFiltersCount > 0 ? (
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Clear All Filters
              </button>
            ) : projects.length === 0 ? (
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Go to Dashboard to Create Project
              </button>
            ) : (
              <div className="text-sm text-gray-500">
                Create tickets from project boards or use the dashboard
              </div>
            )}
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {issues.map((issue) => (
                    <tr key={issue._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getTypeIcon(issue.type)}</span>
                          <div className="min-w-0 flex-1">
                            <Link 
                              to={`/issue/${issue._id}`}
                              className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                            >
                              {issue.title}
                            </Link>
                            <p className="text-sm text-gray-500">#{issue._id?.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {issue.project?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(issue.status)}`}>
                          {issue.status?.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {issue.assignee ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                              {issue.assignee.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="text-sm text-gray-900">{issue.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditIssue(issue)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteIssue(issue._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.map((issue) => (
              <div 
                key={issue._id} 
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-all duration-200 hover:border-blue-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getTypeIcon(issue.type)}</span>
                    <span className="text-xs text-gray-500 font-mono">#{issue._id?.slice(-6)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEditIssue(issue)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteIssue(issue._id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <Link to={`/issue/${issue._id}`} className="block mb-3">
                  <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 line-clamp-2 leading-tight">
                    {issue.title}
                  </h3>
                  {issue.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {issue.description}
                    </p>
                  )}
                </Link>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(issue.status)}`}>
                      {issue.status?.replace('-', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(issue.priority)}`}>
                      {issue.priority}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                  <span className="truncate">{issue.project?.name || 'No project'}</span>
                  {issue.assignee && (
                    <div className="flex items-center space-x-1">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {issue.assignee.name?.charAt(0)?.toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingIssue && (
        <EditTicketModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingIssue(null);
          }}
          issue={editingIssue}
          onUpdated={handleIssueUpdated}
        />
      )}
    </div>
  );
}
