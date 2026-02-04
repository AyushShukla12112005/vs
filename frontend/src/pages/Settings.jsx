import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [nameError, setNameError] = useState('');

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  const handleNameChange = (e) => {
    const value = e.target.value;
    const nameRegex = /^[a-zA-Z\s'-]*$/;
    
    if (nameRegex.test(value)) {
      setProfileData({ ...profileData, name: value });
      setNameError('');
    } else {
      setNameError('Name can only contain letters, spaces, apostrophes, and hyphens');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    const trimmedName = profileData.name.trim();
    
    if (!nameRegex.test(trimmedName)) {
      setNameError('Name can only contain letters, spaces, apostrophes, and hyphens');
      return;
    }

    if (trimmedName.length < 2) {
      setNameError('Name must be at least 2 characters long');
      return;
    }

    setLoading(true);
    try {
      console.log('Updating profile with name:', trimmedName);
      const { data } = await api.patch('/auth/profile', { name: trimmedName });
      console.log('Profile update response:', data);
      updateUser(data.user);
      setProfileData({ ...profileData, name: data.user.name });
      addToast('Profile updated successfully', { type: 'success' });
    } catch (error) {
      console.error('Failed to update profile:', error);
      console.error('Error response:', error.response?.data);
      addToast(error.response?.data?.message || 'Failed to update profile', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    const errors = validatePassword();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setLoading(true);
    setPasswordErrors({});
    
    try {
      await api.patch('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      addToast('Password changed successfully', { type: 'success' });
    } catch (error) {
      console.error('Failed to change password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      setPasswordErrors({ currentPassword: errorMessage });
      addToast(errorMessage, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
      addToast('Logged out successfully', { type: 'success' });
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'password', label: 'Password', icon: '🔒' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <span className="mr-3 text-3xl">⚙️</span>
          Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-4">
              {/* Sidebar Tabs */}
              <div className="md:col-span-1 bg-gray-50 border-r border-gray-200 p-4">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>

                {/* Logout Button */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="md:col-span-3 p-6">
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                    
                    {/* User Avatar */}
                    <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
                      <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={handleNameChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            nameError ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter your full name"
                        />
                        {nameError && (
                          <p className="mt-1 text-sm text-red-600">{nameError}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                      </div>

                      <div className="flex items-center justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setProfileData({ name: user?.name || '', email: user?.email || '' })}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading || nameError || profileData.name === user?.name}
                          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === 'password' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
                    
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            passwordErrors.currentPassword ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter current password"
                        />
                        {passwordErrors.currentPassword && (
                          <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            passwordErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter new password"
                        />
                        {passwordErrors.newPassword && (
                          <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Confirm new password"
                        />
                        {passwordErrors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            setPasswordErrors({});
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          {loading ? 'Changing...' : 'Change Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between py-4 border-b border-gray-200">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                          <p className="text-sm text-gray-500">Receive email updates about your tasks</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-4 border-b border-gray-200">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Task Reminders</h3>
                          <p className="text-sm text-gray-500">Get reminded about upcoming due dates</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-4 border-b border-gray-200">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Dark Mode</h3>
                          <p className="text-sm text-gray-500">Use dark theme for the interface</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={theme === 'dark'}
                            onChange={toggleTheme}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <h3 className="text-sm font-medium text-blue-900">Notification preferences</h3>
                            <p className="text-sm text-blue-700 mt-1">Configure how you want to be notified about updates and changes</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" defaultChecked />
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">Task Assignments</h3>
                            <p className="text-sm text-gray-500">When someone assigns you a task</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" defaultChecked />
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">Comments</h3>
                            <p className="text-sm text-gray-500">When someone comments on your tasks</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" defaultChecked />
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">Status Changes</h3>
                            <p className="text-sm text-gray-500">When task status is updated</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">Project Updates</h3>
                            <p className="text-sm text-gray-500">When projects you're part of are updated</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
