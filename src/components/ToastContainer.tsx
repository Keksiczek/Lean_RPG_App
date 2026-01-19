import React from 'react';
import { useToast } from '../hooks/useToast';
import ToastItem from './ToastItem';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div 
      className="fixed top-0 right-0 p-4 md:p-6 z-[9999] flex flex-col pointer-events-none"
      aria-live="polite"
    >
      <div className="flex flex-col-reverse items-end pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
