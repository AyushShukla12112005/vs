import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);
let idCounter = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, { type = 'info', timeout = 4000 } = {}) => {
    const id = String(idCounter++);
    setToasts((t) => [...t, { id, message, type }]);
    if (timeout > 0) setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), timeout);
    return id;
  }, []);

  const removeToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>{children}</ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
