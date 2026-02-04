import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import EditTicketModal from '../components/EditTicketModal';

export default function IssueDetail() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editing, setEditing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchIssueDetails();
  }, [issueId]);

  const fetchIssueDetails = async () => {
    setLoading(true);
    try {
      const [issueRes, commentsRes] = await Promise.all([
        api.get(`/issues/${issueId}`),
        api.get(`/issues/${issueId}/comments`)
      ]);
      
      setIssue(issueRes.data);
      setComments(commentsRes.data);
      setEditData({
        title: issueRes.data.title,
        description: issueRes.data.description,
        status: issueRes.data.status,
        priority: issueRes.data.priority,
        type: issueRes.data.type
      });
    } catch (error) {
      console.error('Failed to fetch issue details:', error);
      addToast('Failed to fetch issue details', { type: 'error' });
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommenting(true);
    try {
      const { data } = await api.post(`/issues/${issueId}/comments`, {
        content: newComment
      });
      setComments([...comments, data]);
      setNewComment('');
      addToast('Comment added', { type: 'success' });
    } catch (error) {
      addToast('Failed to add comment', { type: 'error' });
    } finally {
      setCommenting(false);
    }
  };

  const handleUpdateIssue = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/issues/${issueId}`, editData);
      setIssue(data);
      setEditing(false);
      addToast('Issue updated', { type: 'success' });
    } catch (error) {
      addToast('Failed to update issue', { type: 'error' });
    }
  };

  const handleTicketUpdated = (updatedIssue) => {
    setIssue(updatedIssue);
    setShowEditModal(false);
  };

  const handleDeleteIssue = async () => {
    if (!window.confirm('Are you sure you want to delete this issue?')) return;

    try {
      await api.delete(`/issues/${issueId}`);
      addToast('Issue deleted', { type: 'success' });
      navigate('/tickets');
    } catch (error) {
      addToast('Failed to delete issue', { type: 'error' });
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'in-progress': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'done': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bug':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
        );
      case 'feature':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        );
      case 'task':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-surface-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-surface-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-surface-100 rounded-lg"></div>
            <div className="h-24 bg-surface-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-surface-900 mb-2">Issue not found</h3>
          <Link to="/tickets" className="text-brand-600 hover:text-brand-700">
            Back to tickets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/tickets"
            className="p-2 rounded-lg hover:bg-surface-100 text-surface-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              {getTypeIcon(issue.type)}
              <span className="text-sm text-surface-500 uppercase font-medium">
                {issue.type}
              </span>
              <span className="text-surface-400">•</span>
              <span className="text-sm text-surface-500">
                #{issue._id.slice(-6)}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-surface-900">
              {editing ? (
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              ) : (
                issue.title
              )}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!editing ? (
            <>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Ticket</span>
              </button>
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-2 text-sm border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
              >
                Quick Edit
              </button>
              <button
                onClick={handleDeleteIssue}
                className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-2 text-sm border border-surface-200 rounded-lg hover:bg-surface-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateIssue}
                className="px-3 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600"
              >
                Save
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-surface-300 scrollbar-track-surface-100">
          {/* Description */}
          <div className="bg-white rounded-lg border border-surface-200 p-6">
            <h2 className="font-semibold text-surface-900 mb-4">Description</h2>
            {editing ? (
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                placeholder="Add a description..."
              />
            ) : (
              <div className="text-surface-700">
                {issue.description ? (
                  <p className="whitespace-pre-wrap">{issue.description}</p>
                ) : (
                  <p className="text-surface-500 italic">No description provided</p>
                )}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white rounded-lg border border-surface-200 p-6">
            <h2 className="font-semibold text-surface-900 mb-4">
              Comments ({comments.length})
            </h2>
            
            {/* Add Comment */}
            <form onSubmit={handleAddComment} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                placeholder="Add a comment..."
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={commenting || !newComment.trim()}
                  className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 text-sm"
                >
                  {commenting ? 'Adding...' : 'Add Comment'}
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-surface-300 scrollbar-track-surface-100">
              {comments.length === 0 ? (
                <p className="text-surface-500 text-center py-4">No comments yet</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="border-b border-surface-100 pb-4 last:border-b-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {comment.author?.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <span className="font-medium text-surface-900">
                        {comment.author?.name || 'Unknown'}
                      </span>
                      <span className="text-xs text-surface-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-surface-700 whitespace-pre-wrap ml-8">
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <div className="bg-white rounded-lg border border-surface-200 p-6">
            <h3 className="font-semibold text-surface-900 mb-4">Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Status</label>
                {editing ? (
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                ) : (
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(issue.status)}`}>
                    {issue.status === 'open' ? 'Open' : issue.status === 'in-progress' ? 'In Progress' : 'Done'}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Priority</label>
                {editing ? (
                  <select
                    value={editData.priority}
                    onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                ) : (
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getPriorityColor(issue.priority)}`}>
                    {issue.priority}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Type</label>
                {editing ? (
                  <select
                    value={editData.type}
                    onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="bug">Bug</option>
                    <option value="feature">Feature</option>
                    <option value="task">Task</option>
                  </select>
                ) : (
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(issue.type)}
                    <span className="text-sm text-surface-900 capitalize">{issue.type}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Project & Assignee */}
          <div className="bg-white rounded-lg border border-surface-200 p-6">
            <h3 className="font-semibold text-surface-900 mb-4">Assignment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Project</label>
                <Link
                  to={`/project/${issue.project?._id}`}
                  className="text-brand-600 hover:text-brand-700 font-medium"
                >
                  {issue.project?.name || 'Unknown Project'}
                </Link>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Assignee</label>
                {issue.assignee ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {issue.assignee.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <span className="text-sm text-surface-900">
                      {issue.assignee.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-surface-500">Unassigned</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Created by</label>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-surface-300 flex items-center justify-center">
                    <span className="text-surface-600 text-xs font-medium">
                      {issue.createdBy?.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <span className="text-sm text-surface-900">
                    {issue.createdBy?.name || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-lg border border-surface-200 p-6">
            <h3 className="font-semibold text-surface-900 mb-4">Timeline</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-surface-500">Created:</span>
                <span className="ml-2 text-surface-900">
                  {new Date(issue.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-surface-500">Updated:</span>
                <span className="ml-2 text-surface-900">
                  {new Date(issue.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Ticket Modal */}
      <EditTicketModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        issue={issue}
        onUpdated={handleTicketUpdated}
      />
    </div>
  );
}