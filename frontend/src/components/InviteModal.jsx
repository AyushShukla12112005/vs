import React, { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export default function InviteModal({ open, onClose, project, onInvited }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting] = useState(null);
  const [error, setError] = useState('');

  const searchTimeout = useRef(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setResults([]);
    setError('');
  }, [open]);

  const search = (q) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    setQuery(q);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      if (!project) return;
      setSearching(true);
      try {
        const { data } = await api.get(`/users/search?q=${encodeURIComponent(q.trim())}`);
        const memberIds = [project.createdBy?._id, ...(project.members?.map((m) => m._id) || [])]
          .filter(Boolean)
          .map((id) => String(id));
        setResults(data.filter((u) => !memberIds.includes(String(u._id))));
      } catch (err) {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const { addToast } = useToast();

  const invite = async (userId) => {
    setError('');
    setInviting(userId);
    try {
      await api.post(`/projects/${project._id}/invite`, { userId });
      setResults((r) => r.filter((u) => u._id !== userId));
      onInvited?.();
      addToast('User invited', { type: 'success' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invite failed';
      setError(msg);
      addToast(msg, { type: 'error' });
    } finally {
      setInviting(null);
    }
  };

  return (
    open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-surface-200/80 p-6 animate-slide-up">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Invite team member</h2>
          <input
            type="text"
            value={query}
            onChange={(e) => search(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50/50 placeholder:text-surface-400 mb-4"
          />
          {error && <div className="mb-3 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">{error}</div>}
          <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-surface-300 scrollbar-track-surface-100 space-y-2">
            {searching && <p className="text-sm text-surface-500 py-2">Searching...</p>}
            {!searching && results.length === 0 && query.trim().length >= 2 && (
              <p className="text-sm text-surface-500 py-4 text-center">No users found or already in project.</p>
            )}
            {results.map((user) => (
              <div key={user._id} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-surface-50 transition-colors">
                <div>
                  <p className="font-medium text-surface-900">{user.name}</p>
                  <p className="text-xs text-surface-500">{user.email}</p>
                </div>
                <button
                  onClick={() => invite(user._id)}
                  disabled={inviting === user._id}
                  className="px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition"
                >
                  {inviting === user._id ? 'Inviting...' : 'Invite'}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-surface-600 hover:bg-surface-100 font-medium transition">Close</button>
          </div>
        </div>
      </div>
    )
  );
}
