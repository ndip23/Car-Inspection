// frontend/src/components/ui/Modal.js
import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg p-6 rounded-2xl glass-card relative mx-4" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-light-border dark:hover:bg-dark-border transition-colors">
          <FiX className="text-light-text-secondary dark:text-dark-text-secondary" />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;