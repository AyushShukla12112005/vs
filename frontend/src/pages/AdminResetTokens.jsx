import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

export default function AdminResetTokens() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const { data } = await api.get('/admin/reset-tokens');
      setTokens(data.tokens || []);
    } catch (err) {
      console.error('Failed to fetch tokens:', err);
      addToast('Failed to fetch reset tokens', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addToast('Copied to clipboard!', { type: 'success' });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const isExpired = (expiry) => {
    return new Date(expiry) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-surface-100">
        <div className="animate-pulse text-brand-600 font-medium">Loading reset tokens...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-surface-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white items-center justify-center text-2xl font-bold mb-5 shadow-lg shadow-orange-500/30">
            🔧
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900">Admin - Reset Tokens</h1>
          <p className="text-surface-500 mt-2">Development tool to view and test password reset tokens</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-surface-200/80 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-surface-900">Active Reset Tokens</h2>
            <button
              onClick={fetchTokens}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
            >
              Refresh
            </button>
          </div>

          {tokens.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-surface-400 text-lg mb-4">No reset tokens found</div>
              <p className="text-surface-500">Request a password reset to see tokens here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tokens.map((token, index) => (
                <div
                  key={index}
                  className={`border rounded-xl p-6 ${
                    isExpired(token.resetTokenExpiry)
                      ? 'border-red-200 bg-red-50'
                      : 'border-green-200 bg-green-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-surface-900">{token.email}</h3>
                      <p className="text-sm text-surface-600">{token.name}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isExpired(token.resetTokenExpiry)
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {isExpired(token.resetTokenExpiry) ? 'Expired' : 'Active'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">
                        Created
                      </label>
                      <p className="text-sm text-surface-600">
                        {formatDate(token.updatedAt)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">
                        Expires
                      </label>
                      <p className="text-sm text-surface-600">
                        {formatDate(token.resetTokenExpiry)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Reset Token
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={token.resetToken}
                        readOnly
                        className="flex-1 px-3 py-2 border border-surface-200 rounded-lg bg-surface-50 text-sm font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(token.resetToken)}
                        className="px-3 py-2 bg-surface-100 hover:bg-surface-200 border border-surface-200 rounded-lg text-sm transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Reset URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={`${window.location.origin}/reset-password?token=${token.resetToken}`}
                        readOnly
                        className="flex-1 px-3 py-2 border border-surface-200 rounded-lg bg-surface-50 text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(`${window.location.origin}/reset-password?token=${token.resetToken}`)}
                        className="px-3 py-2 bg-surface-100 hover:bg-surface-200 border border-surface-200 rounded-lg text-sm transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {!isExpired(token.resetTokenExpiry) && (
                    <div className="flex gap-2">
                      <Link
                        to={`/reset-password?token=${token.resetToken}`}
                        className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm"
                      >
                        Test Reset
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-surface-200">
            <div className="flex justify-center gap-4">
              <Link
                to="/login"
                className="px-4 py-2 bg-surface-100 text-surface-700 rounded-lg hover:bg-surface-200 transition-colors"
              >
                Back to Login
              </Link>
              <Link
                to="/forgot-password"
                className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
              >
                Test Forgot Password
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}