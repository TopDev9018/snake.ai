import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  title?: string;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type'], options?: { title?: string; duration?: number }) => void;
  showSuccess: (message: string, options?: { title?: string; duration?: number }) => void;
  showError: (message: string, options?: { title?: string; duration?: number }) => void;
  showWarning: (message: string, options?: { title?: string; duration?: number }) => void;
  showInfo: (message: string, options?: { title?: string; duration?: number }) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((
    message: string, 
    type: Toast['type'] = 'info',
    options?: { title?: string; duration?: number }
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const duration = options?.duration ?? 5000;
    
    const newToast: Toast = {
      id,
      message,
      type,
      title: options?.title,
      duration
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const showSuccess = useCallback((message: string, options?: { title?: string; duration?: number }) => {
    showToast(message, 'success', { title: options?.title || 'Success', ...options });
  }, [showToast]);

  const showError = useCallback((message: string, options?: { title?: string; duration?: number }) => {
    showToast(message, 'error', { title: options?.title || 'Error', ...options });
  }, [showToast]);

  const showWarning = useCallback((message: string, options?: { title?: string; duration?: number }) => {
    showToast(message, 'warning', { title: options?.title || 'Warning', ...options });
  }, [showToast]);

  const showInfo = useCallback((message: string, options?: { title?: string; duration?: number }) => {
    showToast(message, 'info', { title: options?.title || 'Info', ...options });
  }, [showToast]);

  const value: ToastContextType = {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};
