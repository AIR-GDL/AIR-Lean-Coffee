'use client';

import { useEffect } from 'react';
import CloseIcon from './icons/CloseIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export default function Modal({ isOpen, onClose, title, children, showCloseButton = true, footer, maxWidth = '2xl' }: ModalProps) {
  const maxWidthClass = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl'
  }[maxWidth];
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

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen || !showCloseButton) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showCloseButton, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={showCloseButton ? onClose : undefined}
      />
      <div className={`relative bg-white rounded-2xl shadow-2xl ${maxWidthClass} w-full animate-scale-in max-h-[90vh] flex flex-col`}>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition z-10"
            title="Close"
          >
            <CloseIcon size={24} />
          </button>
        )}
        
        <div className="px-8 pt-8 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 pr-8 truncate break-words">
            {title}
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto px-8 py-4 text-gray-700">
          {children}
        </div>

        {footer && (
          <div className="border-t border-gray-200 bg-gray-50 px-8 py-4 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
