import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/Toast';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// Add global error handling
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});

export function loadFullApplication() {
  try {
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
    console.log('✅ Full application loaded successfully');
  } catch (error) {
    console.error('❌ Failed to render full app:', error);
    document.body.innerHTML = `
      <div style="padding: 50px; font-family: Arial, sans-serif;">
        <h1 style="color: red;">Application Error</h1>
        <p>Failed to load the Bug Tracker application.</p>
        <p><strong>Error:</strong> ${error.message}</p>
        <p>Please check the browser console for more details.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    `;
  }
}