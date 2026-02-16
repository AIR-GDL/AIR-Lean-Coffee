'use client';

import { useState } from 'react';
import { toast } from '@/lib/toast';
import confetti from 'canvas-confetti';
import { Loader2 } from 'lucide-react';
import Modal from './Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

        <div className="space-y-2">
          <Label htmlFor="bug-title">Bug Title *</Label>
          <Input
            id="bug-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief description of the bug"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bug-description">Description *</Label>
          <Textarea
            id="bug-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of the issue, steps to reproduce, and expected behavior"
            rows={5}
            className="resize-none"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label>Severity</Label>
          <Select
            value={severity}
            onValueChange={(value) => setSeverity(value as 'low' | 'medium' | 'high')}
            disabled={isSubmitting}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low - Minor issue, doesn&apos;t affect functionality</SelectItem>
              <SelectItem value="medium">Medium - Noticeable issue, some impact on usage</SelectItem>
              <SelectItem value="high">High - Critical issue, major impact on functionality</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !description.trim() || isSubmitting || isSubmitted}
            className="flex-1 bg-[#005596] hover:bg-[#004478]"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Submitting...' : isSubmitted ? 'Report Sent!' : 'Submit Report'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
