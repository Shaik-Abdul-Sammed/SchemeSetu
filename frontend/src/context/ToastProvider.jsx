import React, { useState, useCallback } from 'react';
import { ToastContext } from './useToast';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast = { id, message, type };

    setToasts((prev) => [...prev.slice(-4), newToast]); // Keep at most 5 toasts

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <aside
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '380px',
          width: 'calc(100% - 32px)',
          pointerEvents: 'none'
        }}
      >
        {toasts.map((toast) => {
          let bg = '#0B192C';
          let border = '#1E3E62';
          let textColor = '#FFFFFF';
          let icon = <Info size={20} style={{ color: '#38BDF8', flexShrink: 0 }} />;

          if (toast.type === 'success') {
            bg = '#064E3B';
            border = '#059669';
            textColor = '#ECFDF5';
            icon = <CheckCircle2 size={20} style={{ color: '#34D399', flexShrink: 0 }} />;
          } else if (toast.type === 'error') {
            bg = '#7F1D1D';
            border = '#DC2626';
            textColor = '#FEF2F2';
            icon = <AlertCircle size={20} style={{ color: '#F87171', flexShrink: 0 }} />;
          } else if (toast.type === 'warning') {
            bg = '#78350F';
            border = '#D97706';
            textColor = '#FFFBEB';
            icon = <AlertTriangle size={20} style={{ color: '#FBBF24', flexShrink: 0 }} />;
          }

          return (
            <div
              key={toast.id}
              style={{
                backgroundColor: bg,
                color: textColor,
                border: `1px solid ${border}`,
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                pointerEvents: 'auto',
                animation: 'slideIn 0.25s ease-out'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                {icon}
                <span style={{ wordBreak: 'break-word', lineHeight: 1.35 }}>{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  opacity: 0.7,
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </aside>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
