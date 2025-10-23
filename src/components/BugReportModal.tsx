'use client';

import { useState } from 'react';
import Modal from './Modal';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BugReportModal({ isOpen, onClose }: BugReportModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
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
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit bug report');
      }

      setSubmitStatus('success');
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setSeverity('medium');
        setSubmitStatus('idle');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting bug report:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle('');
      setDescription('');
      setSeverity('medium');
      setSubmitStatus('idle');
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
        {submitStatus === 'success' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium">✓ Bug report submitted successfully!</p>
            <p className="text-sm text-green-600">Thank you for helping us improve the application.</p>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">✗ Failed to submit bug report</p>
            <p className="text-sm text-red-600">Please try again or contact support.</p>
          </div>
        )}

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
            disabled={!title.trim() || !description.trim() || isSubmitting}
            className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            style={{ backgroundColor: !title.trim() || !description.trim() || isSubmitting ? undefined : '#005596' }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
