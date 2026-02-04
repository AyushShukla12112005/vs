import React from 'react';
import ReactDOM from 'react-dom/client';

// Add comprehensive error handling
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
  showError('JavaScript Error', e.message);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  showError('Promise Rejection', e.reason);
});

function showError(title, message) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed; top: 20px; right: 20px; 
    background: #ff4444; color: white; 
    padding: 15px; border-radius: 8px; 
    z-index: 9999; max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  errorDiv.innerHTML = `<strong>${title}:</strong><br>${message}`;
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, 5000);
}

// Step-by-step loading function
async function loadApplication() {
  const statusDiv = document.getElementById('loading-status');
  
  function updateStatus(message, isError = false) {
    if (statusDiv) {
      statusDiv.innerHTML += `<div style="color: ${isError ? '#ff4444' : '#28a745'}; margin: 5px 0;">
        ${isError ? '❌' : '✅'} ${message}
      </div>`;
    }
    console.log(message);
  }

  try {
    updateStatus('Loading React Router...');
    const { BrowserRouter } = await import('react-router-dom');
    
    updateStatus('Loading App component...');
    const { default: App } = await import('./App');
    
    updateStatus('Loading Context Providers...');
    const { AuthProvider } = await import('./context/AuthContext');
    const { ToastProvider } = await import('./context/ToastContext');
    const { ThemeProvider } = await import('./context/ThemeContext');
    
    updateStatus('Loading Components...');
    const { default: ToastContainer } = await import('./components/Toast');
    const { default: ErrorBoundary } = await import('./components/ErrorBoundary');
    
    updateStatus('Loading Styles...');
    await import('./index.css');
    
    updateStatus('Rendering Application...');
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
    
    updateStatus('Application loaded successfully! 🎉');
    
    // Hide loading screen after a short delay
    setTimeout(() => {
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.style.display = 'none';
      }
    }, 1000);
    
  } catch (error) {
    updateStatus(`Failed to load: ${error.message}`, true);
    console.error('Application loading failed:', error);
    
    // Show fallback UI
    document.getElementById('root').innerHTML = `
      <div style="padding: 50px; font-family: Arial, sans-serif; text-align: center;">
        <h1 style="color: #ff4444;">⚠️ Application Loading Failed</h1>
        <p>There was an error loading the Bug Tracker application.</p>
        <p><strong>Error:</strong> ${error.message}</p>
        <div style="margin: 30px 0;">
          <button onclick="window.location.reload()" style="padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">
            🔄 Reload Page
          </button>
          <button onclick="window.location.href='/quick-login.html'" style="padding: 12px 24px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">
            🔑 Quick Login
          </button>
        </div>
      </div>
    `;
  }
}

// Create loading screen
document.getElementById('root').innerHTML = `
  <div id="loading-screen" style="
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center; 
    min-height: 100vh; 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-family: Arial, sans-serif;
  ">
    <div style="text-align: center; max-width: 500px; padding: 40px;">
      <div style="font-size: 4em; margin-bottom: 20px;">🐛</div>
      <h1 style="margin-bottom: 10px;">Bug Tracker</h1>
      <p style="margin-bottom: 30px; opacity: 0.9;">Loading application...</p>
      
      <div style="
        background: rgba(255,255,255,0.1); 
        border-radius: 10px; 
        padding: 20px; 
        text-align: left;
        backdrop-filter: blur(10px);
      ">
        <div id="loading-status" style="font-family: monospace; font-size: 14px;">
          <div style="color: #ffd700; margin: 5px 0;">⏳ Initializing...</div>
        </div>
      </div>
      
      <div style="margin-top: 20px;">
        <button onclick="window.location.href='/quick-login.html'" style="
          padding: 10px 20px; 
          background: rgba(255,255,255,0.2); 
          color: white; 
          border: 2px solid rgba(255,255,255,0.3); 
          border-radius: 20px; 
          cursor: pointer;
          margin: 5px;
        ">
          🔑 Quick Login
        </button>
        <button onclick="window.location.href='/status.html'" style="
          padding: 10px 20px; 
          background: rgba(255,255,255,0.2); 
          color: white; 
          border: 2px solid rgba(255,255,255,0.3); 
          border-radius: 20px; 
          cursor: pointer;
          margin: 5px;
        ">
          📊 System Status
        </button>
      </div>
    </div>
  </div>
`;

// Start loading the application
loadApplication();