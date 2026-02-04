import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import EditTicketModal from '../components/EditTicketModal';

export default function MyTasks() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [editingTask, setEditingTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchMyTasks();
  }, [user?._id]);

  const fetchMyTasks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/issues/assigned');
      setTasks(data.issues || data || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      addToast('Failed to fetch tasks', { type: 'error' });
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await api.patch(`/issues/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(task => task._id === taskId ? { ...task, status: newStatus } : task));
      addToast('Task status updated', { type: 'success' });
    } catch (error) {
      console.error('Failed to update status:', error);
      addToast('Failed to update status', { type: 'error' });
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(prev => prev.map(task => task._id === updatedTask._id ? updatedTask : task));
    setShowEditModal(false);
    setEditingTask(null);
    addToast('Task updated successfully', { type: 'success' });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-white',
      low: 'bg-green-500 text-white'
    };
    return colors[priority?.toLowerCase()] || 'bg-gray-500 text-white';
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800 border-blue-200',
      'in-progress': 'bg-purple-100 text-purple-800 border-purple-200',
      done: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTypeIcon = (type) => {
    const icons = { bug: '🐛', feature: '✨', task: '📋' };
    return icons[type?.toLowerCase()] || '📝';
  };

  const getPriorityValue = (priority) => {
    const values = { urgent: 4, high: 3, medium: 2, low: 1 };
    return values[priority?.toLowerCase()] || 0;
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      return getPriorityValue(b.priority) - getPriorityValue(a.priority);
    } else if (sortBy === 'dueDate') {
      return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
    } else if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const taskStats = {
    total: tasks.length,
    open: tasks.filter(t => t.status === 'open').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="mr-3 text-3xl">👤</span>
              My Tasks
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {sortedTasks.length} {sortedTasks.length === 1 ? 'task' : 'tasks'} assigned to you
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="priority">Sort by Priority</option>
              <option value="dueDate">Sort by Due Date</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{taskStats.total}</div>
            <div className="text-sm text-gray-500">Total Tasks</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-2xl font-bold text-blue-900">{taskStats.open}</div>
            <div className="text-sm text-blue-600">Open</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="text-2xl font-bold text-purple-900">{taskStats.inProgress}</div>
            <div className="text-sm text-purple-600">In Progress</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-900">{taskStats.done}</div>
            <div className="text-sm text-green-600">Done</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 mt-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({taskStats.total})
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'open' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Open ({taskStats.open})
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'in-progress' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            In Progress ({taskStats.inProgress})
          </button>
          <button
            onClick={() => setFilter('done')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'done' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Done ({taskStats.done})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No Tasks Assigned' : `No ${filter.replace('-', ' ')} Tasks`}
            </h3>
            <p className="text-gray-500">
              {filter === 'all' ? 'You have no tasks assigned to you' : 'Try selecting a different filter'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map((task) => (
              <div key={task._id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(task.type)}</span>
                      <Link to={`/issue/${task._id}`} className="font-medium text-gray-900 hover:text-blue-600 flex-1">
                        {task.title}
                      </Link>
                      <span className="text-xs text-gray-500 font-mono">#{task._id?.slice(-6)}</span>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3 ml-11 line-clamp-2">{task.description}</p>
                    )}

                    <div className="flex items-center space-x-3 ml-11">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(task.status)}`}>
                        {task.status?.replace('-', ' ')}
                      </span>
                      {task.project && (
                        <span className="text-xs text-gray-500">
                          📁 {task.project.name}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="text-xs text-gray-500">
                          📅 {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {task.status !== 'done' && (
                      <div className="flex items-center space-x-1">
                        {task.status === 'open' && (
                          <button
                            onClick={() => handleStatusUpdate(task._id, 'in-progress')}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 text-xs font-medium transition-colors"
                            title="Start working"
                          >
                            Start
                          </button>
                        )}
                        {task.status === 'in-progress' && (
                          <button
                            onClick={() => handleStatusUpdate(task._id, 'done')}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-xs font-medium transition-colors"
                            title="Mark as done"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => handleEditTask(task)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit task"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showEditModal && editingTask && (
        <EditTicketModal
          open={showEditModal}
          onClose={() => { setShowEditModal(false); setEditingTask(null); }}
          issue={editingTask}
          onUpdated={handleTaskUpdated}
        />
      )}
    </div>
  );
}
