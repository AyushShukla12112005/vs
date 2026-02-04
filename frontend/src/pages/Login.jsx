import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      addToast('Signed in', { type: 'success' });
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(msg);
      addToast(msg, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-surface-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white items-center justify-center text-2xl font-bold mb-5 shadow-lg shadow-brand-500/30">B</div>
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900">Welcome back</h1>
          <p className="text-surface-500 mt-2">Sign in to your Bug Tracker account</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-surface-200/80 p-8 animate-slide-up">
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">{error}</div>
          )}
          <label className="block text-sm font-semibold text-surface-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50/50 placeholder:text-surface-400 mb-5 transition"
            placeholder="you@example.com"
            required
          />
          <label className="block text-sm font-semibold text-surface-700 mb-2">Password</label>
          <div className="relative mb-6">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50/50 placeholder:text-surface-400 transition"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-700 p-1"
            >
              {showPassword ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.077.162-2.114.462-3.081"/></svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              )}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 shadow-lg shadow-brand-500/25 disabled:opacity-50 disabled:shadow-none transition-all"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          
          <div className="mt-4 text-center">
            <Link 
              to="/forgot-password" 
              className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
          
          <p className="mt-6 text-center text-surface-500 text-sm">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-brand-600 font-semibold hover:text-brand-700 hover:underline transition">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
