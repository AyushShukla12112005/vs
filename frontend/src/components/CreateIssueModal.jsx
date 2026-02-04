import React, { useState } from 'react';
import api from '../api/axios';
import Modal from './Modal';
import { useToast } from '../context/ToastContext';

export default function CreateIssueModal({ open, onClose, projectId, projectMembers, onCreated, onIssueCreated }) {
  const { addToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('bug');
  const [priority, setPriority] = useState('medium');
  const [assignee, setAssignee] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { data } = await api.post('/issues', {
        project: projectId,
        title,
        description,
        type,
        priority,
        assignee: assignee || undefined,
      });
      
      // Call both callbacks if they exist
      if (onCreated) onCreated(data);
      if (onIssueCreated) onIssueCreated();
      
      // notify other pages (e.g., Tickets) that a new issue was created
      try {
        window.dispatchEvent(new CustomEvent('issue:created', { detail: data }));
      } catch (e) {
        // ignore if CustomEvent unsupported
      }
      // Fallback: write to localStorage so other tabs/windows receive storage event
      try {
        localStorage.setItem('issue:created', JSON.stringify({ id: data._id, t: Date.now() }));
        // quick cleanup after a short delay to avoid clutter
        setTimeout(() => localStorage.removeItem('issue:created'), 1000);
      } catch (e) {
        // ignore
      }
      setTitle('');
      setDescription('');
      setType('bug');
      setPriority('medium');
      setAssignee('');
      addToast('Issue created', { type: 'success' });
      onClose();
    } catch (err) {
      console.error('Error creating issue:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to create issue';
      setError(msg);
      addToast(msg, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New issue">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">{error}</div>}
        <div>
          <label className="block text-sm font-semibold text-surface-700 mb-2">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50/50 placeholder:text-surface-400"
            placeholder="Short descriptive title"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-surface-700 mb-2">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50/50 placeholder:text-surface-400 resize-none"
            rows={3}
            placeholder="Add more details..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-white"
            >
              <option value="task">📋 Task</option>
              <option value="bug">🐛 Bug</option>
              <option value="feature">✨ Feature</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-surface-700 mb-2">Assignee (optional)</label>
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-white"
          >
            <option value="">Unassigned</option>
            {projectMembers?.map((m) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-surface-600 hover:bg-surface-100 font-medium transition">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 disabled:opacity-50 shadow-lg shadow-brand-500/25 transition">
            {loading ? 'Creating...' : 'Create issue'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
