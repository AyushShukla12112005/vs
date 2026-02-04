import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleNameChange = (e) => {
    const value = e.target.value;
    // Allow only alphabets, spaces, and common name characters (apostrophes, hyphens)
    const nameRegex = /^[a-zA-Z\s'-]*$/;
    
    if (nameRegex.test(value)) {
      setName(value);
      setNameError('');
    } else {
      setNameError('Name can only contain letters, spaces, apostrophes, and hyphens');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate name contains only allowed characters
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    const trimmedName = name.trim();
    
    if (!nameRegex.test(trimmedName)) {
      setError('Name can only contain letters, spaces, apostrophes, and hyphens');
      return;
    }
    
    // Validate name is not empty after trimming
    if (trimmedName.length === 0) {
      setError('Name is required');
      return;
    }
    
    // Validate name has at least one letter
    if (!/[a-zA-Z]/.test(trimmedName)) {
      setError('Name must contain at least one letter');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      await register(trimmedName, email, password);
      addToast('Account created', { type: 'success' });
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
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
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900">Create account</h1>
          <p className="text-surface-500 mt-2">Get started with Bug Tracker</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-surface-200/80 p-8 animate-slide-up">
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">{error}</div>
          )}
          <label className="block text-sm font-semibold text-surface-700 mb-2">
            Name
            <span className="text-xs font-normal text-surface-500 ml-2">(letters, spaces, apostrophes, hyphens only)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            className={`w-full px-4 py-3 rounded-xl border bg-surface-50/50 placeholder:text-surface-400 mb-1 transition focus:outline-none focus:ring-2 ${
              nameError 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                : 'border-surface-200 focus:border-brand-500 focus:ring-brand-500/20'
            }`}
            placeholder="e.g., John Smith, Mary O'Connor, Jean-Pierre"
            required
            maxLength={50}
          />
          {nameError && (
            <p className="text-red-500 text-xs mb-4 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {nameError}
            </p>
          )}
          {!nameError && (
            <div className="mb-4"></div>
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
          <label className="block text-sm font-semibold text-surface-700 mb-2">Password (min 6)</label>
          <div className="relative mb-6">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50/50 placeholder:text-surface-400 transition"
              placeholder="••••••••"
              required
              minLength={6}
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
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
          
          <p className="mt-6 text-center text-surface-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700 hover:underline transition">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
