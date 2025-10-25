'use client';

import { useEffect } from 'react';
import CloseIcon from './icons/CloseIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export default function Modal({ isOpen, onClose, title, children, showCloseButton = true }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={showCloseButton ? onClose : undefined}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-scale-in max-h-[90vh]">
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          >
            <CloseIcon size={24} />
          </button>
        )}
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pr-8">
          {title}
        </h2>
        
        <div className="text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
}
