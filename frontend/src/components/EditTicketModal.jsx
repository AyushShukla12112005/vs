import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

export default function EditTicketModal({ open, onClose, issue, onUpdated }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'bug',
    status: 'open',
    priority: 'medium',
    assignee: '',
    dueDate: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (issue && open) {
      setFormData({
        title: issue.title || '',
        description: issue.description || '',
        type: issue.type || 'bug',
        status: issue.status || 'open',
        priority: issue.priority || 'medium',
        assignee: issue.assignee?._id || '',
        dueDate: issue.dueDate ? new Date(issue.dueDate).toISOString().split('T')[0] : ''
      });
      setErrors({});
      loadUsers();
    }
  }, [issue, open]);

  const loadUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast('Please fix the errors before saving', { type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        assignee: formData.assignee || null,
        dueDate: formData.dueDate || null
      };

      const { data } = await api.put(`/issues/${issue._id}`, updateData);
      onUpdated(data);
      addToast('Ticket updated successfully', { type: 'success' });
      onClose();
    } catch (error) {
      console.error('Failed to update ticket:', error);
      const message = error.response?.data?.message || 'Failed to update ticket';
      addToast(message, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bug': return '🐛';
      case 'feature': return '✨';
      case 'task': return '📋';
      default: return '📝';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'done': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!open || !issue) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-surface-200 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 bg-gradient-to-r from-brand-50 to-surface-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-surface-900">Edit Ticket</h2>
              <p className="text-sm text-surface-600">#{issue._id.slice(-6)} • {issue.project?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-surface-200 text-surface-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-surface-300 scrollbar-track-surface-100">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border bg-white text-lg font-medium transition-colors ${
                      errors.title 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-surface-200 focus:border-brand-500 focus:ring-brand-500/20'
                    } focus:outline-none focus:ring-2`}
                    placeholder="Enter a descriptive title..."
                    maxLength={200}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.title}
                    </p>
                  )}
                  <p className="text-xs text-surface-500 mt-1">
                    {formData.title.length}/200 characters
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={6}
                    className={`w-full px-4 py-3 rounded-xl border bg-white resize-none transition-colors ${
                      errors.description 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-surface-200 focus:border-brand-500 focus:ring-brand-500/20'
                    } focus:outline-none focus:ring-2`}
                    placeholder="Provide detailed information about this ticket..."
                    maxLength={1000}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.description}
                    </p>
                  )}
                  <p className="text-xs text-surface-500 mt-1">
                    {formData.description.length}/1000 characters
                  </p>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-3">Type</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { value: 'bug', label: 'Bug', icon: '🐛', desc: 'Something isn\'t working' },
                      { value: 'feature', label: 'Feature', icon: '✨', desc: 'New functionality' },
                      { value: 'task', label: 'Task', icon: '📋', desc: 'General work item' }
                    ].map((type) => (
                      <label
                        key={type.value}
                        className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.type === type.value
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-surface-200 hover:border-surface-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={type.value}
                          checked={formData.type === type.value}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          className="sr-only"
                        />
                        <span className="text-lg mr-3">{type.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-surface-900">{type.label}</div>
                          <div className="text-xs text-surface-500">{type.desc}</div>
                        </div>
                        {formData.type === type.value && (
                          <svg className="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status & Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    >
                      <option value="open">📋 Open</option>
                      <option value="in-progress">⚡ In Progress</option>
                      <option value="done">✅ Done</option>
                    </select>
                    <div className="mt-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(formData.status)}`}>
                        {formData.status === 'open' ? 'Open' : formData.status === 'in-progress' ? 'In Progress' : 'Done'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-2">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    >
                      <option value="low">🟢 Low</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="high">🟠 High</option>
                      <option value="urgent">🔴 Urgent</option>
                    </select>
                    <div className="mt-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(formData.priority)}`}>
                        {formData.priority}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assignee */}
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-2">Assignee</label>
                  <select
                    value={formData.assignee}
                    onChange={(e) => handleInputChange('assignee', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    <option value="">👤 Unassigned</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  {formData.assignee && (
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {users.find(u => u._id === formData.assignee)?.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <span className="text-sm text-surface-900">
                        {users.find(u => u._id === formData.assignee)?.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 rounded-lg border bg-white transition-colors ${
                      errors.dueDate 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-surface-200 focus:border-brand-500 focus:ring-brand-500/20'
                    } focus:outline-none focus:ring-2`}
                  />
                  {errors.dueDate && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.dueDate}
                    </p>
                  )}
                  {formData.dueDate && (
                    <p className="text-xs text-surface-500 mt-1">
                      Due in {Math.ceil((new Date(formData.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-surface-200 bg-surface-50">
          <div className="flex items-center space-x-2 text-sm text-surface-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Last updated: {new Date(issue.updatedAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-surface-700 border border-surface-200 rounded-xl hover:bg-surface-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
            >
              {loading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}