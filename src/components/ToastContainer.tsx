import React from 'react';
import { useToast, Toast } from '../contexts/ToastContext';

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { removeToast } = useToast();

  const getToastClass = () => {
    switch (toast.type) {
      case 'success':
        return 'toast-success bg-success text-white';
      case 'error':
        return 'toast-error bg-danger text-white';
      case 'warning':
        return 'toast-warning bg-warning text-dark';
      case 'info':
      default:
        return 'toast-info bg-info text-white';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div 
      className={`toast show ${getToastClass()}`} 
      role="alert" 
      style={{ marginBottom: '10px' }}
    >
      <div className="toast-header">
        <span className="me-2">{getIcon()}</span>
        <strong className="me-auto">{toast.title || 'Notification'}</strong>
        <button
          type="button"
          className="btn-close"
          onClick={() => removeToast(toast.id)}
          aria-label="Close"
        ></button>
      </div>
      <div className="toast-body">
        {toast.message}
      </div>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div 
      className="toast-container position-fixed top-0 end-0 p-3" 
      style={{ zIndex: 1055 }}
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default ToastContainer;
