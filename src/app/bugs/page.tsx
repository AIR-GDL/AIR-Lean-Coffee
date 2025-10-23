'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import BugIcon from '@/components/icons/BugIcon';
import CheckIcon from '@/components/icons/CheckIcon';
import EditIcon from '@/components/icons/EditIcon';
import DeleteIcon from '@/components/icons/DeleteIcon';
import ArrowBackIcon from '@/components/icons/ArrowBackIcon';

interface BugReport {
  _id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  userAgent: string;
  userName?: string;
  userEmail?: string;
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: string;
}

export default function BugsPage() {
  const router = useRouter();
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingBug, setEditingBug] = useState<BugReport | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingBugId, setDeletingBugId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    status: 'open' | 'in-progress' | 'resolved';
  }>({
    title: '',
    description: '',
    severity: 'medium',
    status: 'open',
  });

  useEffect(() => {
    fetchBugs();
  }, []);

  const fetchBugs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/bugs');
      if (!response.ok) throw new Error('Failed to fetch bugs');
      const data = await response.json();
      setBugs(data.data || []);
    } catch (error) {
      console.error('Error fetching bugs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (bug: BugReport) => {
    setEditingBug(bug);
    setEditForm({
      title: bug.title,
      description: bug.description,
      severity: bug.severity,
      status: bug.status,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingBug) return;

    try {
      const response = await fetch(`/api/bugs/${editingBug._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error('Failed to update bug');

      setIsEditModalOpen(false);
      setEditingBug(null);
      await fetchBugs();
    } catch (error) {
      console.error('Error updating bug:', error);
      alert('Failed to update bug');
    }
  };

  const handleDeleteClick = (bugId: string) => {
    setDeletingBugId(bugId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingBugId) return;

    try {
      const response = await fetch(`/api/bugs/${deletingBugId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete bug');

      toast.success('Bug report deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingBugId(null);
      await fetchBugs();
    } catch (error) {
      console.error('Error deleting bug:', error);
      toast.error('Failed to delete bug');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'open':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
              title="Go back"
            >
              <ArrowBackIcon size={24} />
            </button>
            <h1 className="text-4xl font-bold text-gray-900">Bug Reports</h1>
          </div>
          <div className="text-sm text-gray-600">
            Total: <span className="font-bold text-lg">{bugs.length}</span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-2xl font-semibold text-gray-700">Loading bugs...</div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && bugs.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <BugIcon size={48} color="#9ca3af" />
            <p className="text-gray-600 mt-4 text-lg">No bug reports yet</p>
          </div>
        )}

        {/* Bugs List */}
        {!isLoading && bugs.length > 0 && (
          <div className="space-y-4">
            {bugs.map((bug) => (
              <div
                key={bug._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border-l-4"
                style={{
                  borderLeftColor:
                    bug.severity === 'high'
                      ? '#dc2626'
                      : bug.severity === 'medium'
                        ? '#f59e0b'
                        : '#10b981',
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold text-gray-900">{bug.title}</h2>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(bug.severity)}`}>
                        {bug.severity.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit ${getStatusBgColor(bug.status)}`}>
                        {bug.status === 'resolved' && <CheckIcon size={16} color="currentColor" />}
                        <span>{bug.status.charAt(0).toUpperCase() + bug.status.slice(1)}</span>
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap mb-3">{bug.description}</p>
                    <div className="text-sm text-gray-600 mb-3">
                      {bug.userName && (
                        <span>
                          <span className="font-medium">Reported by:</span> {bug.userName}
                          {bug.userEmail && <span className="text-gray-500"> ({bug.userEmail})</span>}
                          <span className="text-gray-500 mx-2">•</span>
                          <span>Reported: {new Date(bug.createdAt).toLocaleDateString()}</span>
                          <span className="text-gray-500 mx-2">•</span>
                          <span>Bug reference: {bug._id.slice(-8)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEditClick(bug)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                  >
                    <EditIcon size={18} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(bug._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                  >
                    <DeleteIcon size={18} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingBug && (
        <div className="fixed inset-0 bg-gray-500/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">Edit Bug Report</h2>
            </div>

            {/* Scrolleable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                    <select
                      value={editForm.severity}
                      onChange={(e) => setEditForm({ ...editForm, severity: e.target.value as 'low' | 'medium' | 'high' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'open' | 'in-progress' | 'resolved' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Footer with Buttons */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex gap-3 rounded-b-2xl">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-500/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Delete Bug Report</h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-700">Are you sure you want to delete this bug report? This action cannot be undone.</p>
            </div>
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex gap-3 rounded-b-2xl">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
