'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BugReportModal({ isOpen, onClose }: BugReportModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const getUserInfo = () => {
    try {
      const storedUser = sessionStorage.getItem('lean-coffee-user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return { userName: user.name, userEmail: user.email };
      }
    } catch (error) {
      console.error('Error getting user info:', error);
    }
    return { userName: undefined, userEmail: undefined };
  };

  const triggerBugConfetti = () => {
    const scalar = 2;
    const bugEmoji = confetti.shapeFromText({ text: '🐛', scalar });

    const defaults = {
      spread: 360,
      ticks: 60,
      gravity: 0,
      decay: 0.96,
      startVelocity: 20,
      shapes: [bugEmoji],
      scalar,
    };

    confetti({
      ...defaults,
      particleCount: 50,
      scalar: scalar * 1.5,
      origin: { y: 0.6 },
    });
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const { userName, userEmail } = getUserInfo();
      const response = await fetch('/api/bugs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          severity,
          timestamp: new Date().toISOString(),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          userName,
          userEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit bug report');
      }

      // Mark as submitted successfully
      setIsSubmitted(true);

      // Trigger confetti
      triggerBugConfetti();

      // Show success toast
      toast.success('Bug report submitted successfully!');

      // Close modal after delay
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setSeverity('medium');
        setIsSubmitted(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting bug report:', error);
      toast.error('Failed to submit bug report. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isSubmitted) {
      setTitle('');
      setDescription('');
      setSeverity('medium');
      setIsSubmitted(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Report a Bug"
    >
      <div className="space-y-4">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bug Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief description of the bug"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of the issue, steps to reproduce, and expected behavior"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={5}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Severity
          </label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as 'low' | 'medium' | 'high')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          >
            <option value="low">Low - Minor issue, doesn't affect functionality</option>
            <option value="medium">Medium - Noticeable issue, some impact on usage</option>
            <option value="high">High - Critical issue, major impact on functionality</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !description.trim() || isSubmitting || isSubmitted}
            className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            style={{ backgroundColor: !title.trim() || !description.trim() || isSubmitting || isSubmitted ? undefined : '#005596' }}
          >
            {isSubmitting && <LoadingSpinner size={16} color="white" />}
            {isSubmitting ? 'Submitting...' : isSubmitted ? 'Report Sent!' : 'Submit Report'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
