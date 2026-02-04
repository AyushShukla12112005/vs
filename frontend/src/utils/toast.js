// Simple toast utility that works with our existing ToastContext
export const toast = {
  success: (message) => {
    // This will be handled by the ToastContext
    if (window.addToast) {
      window.addToast(message, { type: 'success' });
    } else {
      console.log('Success:', message);
    }
  },
  error: (message) => {
    if (window.addToast) {
      window.addToast(message, { type: 'error' });
    } else {
      console.error('Error:', message);
    }
  },
  info: (message) => {
    if (window.addToast) {
      window.addToast(message, { type: 'info' });
    } else {
      console.log('Info:', message);
    }
  }
};

// Make toast available globally for components that expect it
if (typeof window !== 'undefined') {
  window.toast = toast;
}