'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QuestionMarkIcon from './icons/QuestionMarkIcon';
import BugIcon from './icons/BugIcon';
import ChangelogIcon from './icons/ChangelogIcon';

interface FeedbackMenuProps {
  onReportBug: () => void;
  onViewChangelog: () => void;
}

export default function FeedbackMenu({ onReportBug, onViewChangelog }: FeedbackMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleReportBug = () => {
    onReportBug();
    setIsOpen(false);
  };

  const handleViewChangelog = () => {
    onViewChangelog();
    setIsOpen(false);
  };

  const handleViewBugReports = () => {
    router.push('/bugs');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
        title="Feedback & Help"
        aria-label="Open feedback menu"
        aria-expanded={isOpen}
      >
        <QuestionMarkIcon size={24} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <button
            onClick={handleReportBug}
            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-100 flex items-center gap-2"
          >
            <BugIcon size={20} color="#dc2626" />
            <span className="font-medium text-gray-700">Report Bug</span>
          </button>
          <button
            onClick={handleViewChangelog}
            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-100 flex items-center gap-2"
          >
            <ChangelogIcon size={20} color="#2563eb" />
            <span className="font-medium text-gray-700">Changelog</span>
          </button>
          <button
            onClick={handleViewBugReports}
            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-center gap-2"
          >
            <BugIcon size={20} color="#dc2626" />
            <span className="font-medium text-gray-700">View Bug Reports</span>
          </button>
        </div>
      )}
    </div>
  );
}
