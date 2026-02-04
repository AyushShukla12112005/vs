import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/Toast';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
// CSS import commented out to test if it's causing issues
// import './index.css';

// Add global error handling
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
  alert('JavaScript Error: ' + e.message);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  alert('Promise Rejection: ' + e.reason);
});

try {
  console.log('Starting React app without CSS...');
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <App />
              <ToastContainer />
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
  console.log('React app rendered successfully (no CSS)');
} catch (error) {
  console.error('Failed to render app:', error);
  alert('Failed to render app: ' + error.message);
  document.body.innerHTML = `
    <div style="padding: 50px; font-family: Arial, sans-serif;">
      <h1 style="color: red;">Application Error (No CSS Version)</h1>
      <p>Failed to load the Bug Tracker application even without CSS.</p>
      <p><strong>Error:</strong> ${error.message}</p>
      <p>This indicates the issue is not with CSS but with JavaScript/React code.</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Reload Page
      </button>
    </div>
  `;
}