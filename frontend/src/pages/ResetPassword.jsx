import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      addToast('Invalid reset link', { type: 'error' });
      navigate('/login');
    }
  }, [token, navigate, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      addToast('Please fill in all fields', { type: 'error' });
      return;
    }
    
    if (password.length < 6) {
      addToast('Password must be at least 6 characters', { type: 'error' });
      return;
    }
    
    if (password !== confirmPassword) {
      addToast('Passwords do not match', { type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', { 
        token, 
        password 
      });
      
      addToast(data.message, { type: 'success' });
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password';
      addToast(msg, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-surface-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white items-center justify-center text-2xl font-bold mb-5 shadow-lg shadow-brand-500/30">
            B
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900">Reset password</h1>
          <p className="text-surface-500 mt-2">Enter your new password</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-surface-200/80 p-8 animate-slide-up">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-surface-700 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-surface-200 bg-surface-50/50 placeholder:text-surface-400 transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-semibold text-surface-700 mb-2">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50/50 placeholder:text-surface-400 transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Confirm new password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}