import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      addToast('Please enter your email address', { type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setSent(true);
      addToast(data.message, { type: 'success' });
      
      // In development, show the reset token for testing
      if (data.resetToken) {
        console.log('Reset token for testing:', data.resetToken);
        console.log('Reset URL:', data.resetUrl);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reset email';
      addToast(msg, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-surface-100 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white items-center justify-center text-2xl font-bold mb-5 shadow-lg shadow-green-500/30">
              ✓
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-surface-900">Check your email</h1>
            <p className="text-surface-500 mt-2">We've sent a password reset link to {email}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-surface-200/80 p-8 text-center">
            <p className="text-surface-600 mb-6">
              Click the link in your email to reset your password. The link will expire in 10 minutes.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full px-4 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-surface-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white items-center justify-center text-2xl font-bold mb-5 shadow-lg shadow-brand-500/30">
            B
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900">Forgot password?</h1>
          <p className="text-surface-500 mt-2">Enter your email to receive a reset link</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-surface-200/80 p-8 animate-slide-up">
          <label className="block text-sm font-semibold text-surface-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50/50 placeholder:text-surface-400 mb-6 transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="Enter your email address"
            required
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors mr-4"
            >
              Back to Sign In
            </Link>
            {process.env.NODE_ENV === 'development' && (
              <Link
                to="/admin/reset-tokens"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                View Reset Tokens (Dev)
              </Link>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}