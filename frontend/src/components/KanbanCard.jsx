import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Modal from './Modal';
import { useToast } from '../context/ToastContext';

const PRIORITY_COLOR = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};
const TYPE_LABEL = { bug: 'Bug', feature: 'Feature', task: 'Task' };
const TYPE_ICON = { bug: '🐛', feature: '✨', task: '📋' };

export default function KanbanCard({ issue, projectId, members, currentUserId, projectCreatorId, onUpdate, onDelete, dragHandleProps = {} }) {
  const canDelete =
    currentUserId &&
    (String(issue.createdBy?._id || issue.createdBy) === String(currentUserId) ||
      String(projectCreatorId) === String(currentUserId));
  const [showEdit, setShowEdit] = useState(false);
  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description || '');
  const [priority, setPriority] = useState(issue.priority);
  const [assignee, setAssignee] = useState(issue.assignee?._id || '');
  const [saving, setSaving] = useState(false);

  const { addToast } = useToast();

  const [isInlineEdit, setIsInlineEdit] = useState(false);

  useEffect(() => {
    // keep local form state in sync when the issue prop changes
    setTitle(issue.title);
    setDescription(issue.description || '');
    setPriority(issue.priority);
    setAssignee(issue.assignee?._id || '');
  }, [issue._id, issue.title, issue.description, issue.priority, issue.assignee]);

  const handleInlineSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch(`/issues/${issue._id}`, {
        title,
        description,
        priority,
        assignee: assignee || null,
      });
      onUpdate(data);
      setIsInlineEdit(false);
      
      // Emit event for other components
      try {
        window.dispatchEvent(new CustomEvent('issue:updated', { detail: data }));
        localStorage.setItem('issue:updated', JSON.stringify({ id: data._id, t: Date.now() }));
        setTimeout(() => localStorage.removeItem('issue:updated'), 1000);
      } catch (e) {
        // ignore if CustomEvent unsupported
      }
      
      addToast('Ticket updated', { type: 'success' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update ticket';
      addToast(msg, { type: 'error' });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch(`/issues/${issue._id}`, {
        title,
        description,
        priority,
        assignee: assignee || null,
      });
      onUpdate(data);
      setShowEdit(false);
      
      // Emit event for other components
      try {
        window.dispatchEvent(new CustomEvent('issue:updated', { detail: data }));
        localStorage.setItem('issue:updated', JSON.stringify({ id: data._id, t: Date.now() }));
        setTimeout(() => localStorage.removeItem('issue:updated'), 1000);
      } catch (e) {
        // ignore if CustomEvent unsupported
      }
      
      addToast('Ticket updated', { type: 'success' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update ticket';
      addToast(msg, { type: 'error' });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this ticket?')) return;
    try {
      await api.delete(`/issues/${issue._id}`);
      onDelete(issue._id);
      addToast('Ticket deleted', { type: 'success' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete ticket';
      addToast(msg, { type: 'error' });
      console.error(err);
    }
  };

  return (
    <>
      <div
        {...dragHandleProps}
        className="group bg-white rounded-xl border border-surface-200/90 p-4 shadow-card hover:shadow-card-hover transition-all duration-200 hover:border-brand-200/60 cursor-grab active:cursor-grabbing"
        onClick={(e) => {
          // open modal only when not inline-editing and click isn't on a button/link
          if (!e.target.closest('a') && !e.target.closest('button') && !isInlineEdit) setShowEdit(true);
        }}
      >
        <div className="flex items-start gap-3">
          <div
            data-drag-handle
            role="button"
            aria-label="Drag ticket"
            className="shrink-0 mt-0.5 p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors touch-none"
            title="Drag to move"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            {isInlineEdit ? (
              <form onSubmit={handleInlineSave} className="space-y-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-surface-200 text-sm"
                  required
                  autoFocus
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-surface-200 text-sm resize-none"
                  rows={2}
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-surface-200 text-sm bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <select
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-surface-200 text-sm bg-white"
                    >
                      <option value="">Unassigned</option>
                      {members?.map((m) => (
                        <option key={m._id} value={m._id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setIsInlineEdit(false); 
                        setTitle(issue.title); 
                        setDescription(issue.description || ''); 
                        setPriority(issue.priority); 
                        setAssignee(issue.assignee?._id || ''); 
                      }} 
                      className="px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-700 text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={saving} 
                      className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                    >
                      {saving && (
                        <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                      <span>{saving ? 'Saving...' : 'Save'}</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/project/${projectId}/issue/${issue._id}`}
                    className="font-medium text-surface-900 hover:text-brand-600 line-clamp-2 flex-1 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {issue.title}
                  </Link>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={(e) => { e.stopPropagation(); setIsInlineEdit(true); }} title="Edit" className="opacity-0 group-hover:opacity-100 transition-opacity text-surface-400 hover:text-surface-600 p-1 rounded-md">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h6M11 9h6M7 5h.01M7 9h.01M7 13h10M7 17h10" /></svg>
                    </button>
                    <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide ${PRIORITY_COLOR[issue.priority] || PRIORITY_COLOR.medium}`}>
                      {issue.priority}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-surface-500 mt-1.5 line-clamp-2">{issue.description || 'No description'}</p>
                <div className="flex items-center justify-between mt-3 gap-2">
                  <span className="text-xs text-surface-400 flex items-center gap-1">
                    <span>{TYPE_ICON[issue.type] || '•'}</span>
                    {TYPE_LABEL[issue.type]}
                  </span>
                  {issue.assignee ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-surface-200 flex items-center justify-center text-[11px] font-semibold text-surface-700">{(issue.assignee.name || '').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}</div>
                      <span className="text-xs text-surface-600 truncate max-w-[100px]" title={issue.assignee.name}>{issue.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-surface-400 italic">Unassigned</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit ticket">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50/50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50/50 resize-none"
              rows={3}
            />
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
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">Assignee</label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-white"
            >
              <option value="">Unassigned</option>
              {members?.map((m) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-between pt-4 border-t border-surface-100">
            {canDelete ? (
              <button 
                type="button" 
                onClick={handleDelete} 
                className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete</span>
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowEdit(false)} 
                className="px-6 py-2.5 rounded-xl text-surface-600 hover:bg-surface-100 font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={saving} 
                className="px-6 py-2.5 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/25 transition-all flex items-center space-x-2"
              >
                {saving && (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
