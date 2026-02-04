import React from 'react';
import { useToast } from '../context/ToastContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();
  return (
    <div className="fixed right-4 bottom-6 z-50 space-y-3 w-[320px] pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded-lg p-3 shadow-lg border flex items-start gap-3 ${
            t.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' : t.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-white border-surface-200 text-surface-900'
          }`}
        >
          <div className="flex-1 text-sm whitespace-pre-wrap">{t.message}</div>
          <button onClick={() => removeToast(t.id)} className="text-surface-500 text-xs">Dismiss</button>
        </div>
      ))}
    </div>
  );
}
