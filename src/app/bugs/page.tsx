'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Bug, Check, Pencil, Trash2 } from 'lucide-react';
import BugFiltersPanel from '@/components/BugFiltersPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
  const [filters, setFilters] = useState({
    severity: [] as string[],
    status: [] as string[],
    searchQuery: '',
  });

  useEffect(() => {
    // Check authentication
    const storedUser = sessionStorage.getItem('lean-coffee-user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    setIsAuthenticated(true);
    fetchBugs();
  }, [router]);

  // Subscribe to Pusher events for real-time updates
  usePusherBugs({
    onBugCreated: () => fetchBugs(),
    onBugUpdated: () => fetchBugs(),
    onBugDeleted: () => fetchBugs(),
  });

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

      // Trigger Pusher event
      await triggerBugEvent('bug-updated', { bugId: editingBug._id, ...editForm });

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

      // Trigger Pusher event
      await triggerBugEvent('bug-deleted', { bugId: deletingBugId });

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

  const filteredBugs = useMemo(() => {
    return bugs.filter((bug) => {
      const matchesSeverity = filters.severity.length === 0 || filters.severity.includes(bug.severity);
      const matchesStatus = filters.status.length === 0 || filters.status.includes(bug.status);
      const matchesSearch =
        filters.searchQuery === '' ||
        bug.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        bug.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        bug._id.slice(-8).includes(filters.searchQuery);

      return matchesSeverity && matchesStatus && matchesSearch;
    });
  }, [bugs, filters]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              title="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-4xl font-bold text-foreground">Bug Reports</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            Total: <span className="font-bold text-lg">{bugs.length}</span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-2xl font-semibold text-muted-foreground">Loading bugs...</div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && bugs.length === 0 && (
          <div className="bg-card rounded-xl border shadow-sm p-12 text-center">
            <Bug className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground mt-4 text-lg">No bug reports yet</p>
          </div>
        )}

        {/* Filters and Bugs */}
        <div className="flex gap-6">
          {/* Filters Panel */}
          <BugFiltersPanel bugs={bugs} filters={filters} onFiltersChange={setFilters} bugCount={filteredBugs.length} />

          {/* Main Content */}
          <div className="flex-1">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-2xl font-semibold text-muted-foreground">Loading bugs...</div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredBugs.length === 0 && bugs.length > 0 && (
              <div className="bg-card rounded-xl border shadow-sm p-12 text-center">
                <Bug className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground mt-4 text-lg">No bugs match your filters</p>
              </div>
            )}

            {!isLoading && bugs.length === 0 && (
              <div className="bg-card rounded-xl border shadow-sm p-12 text-center">
                <Bug className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground mt-4 text-lg">No bug reports yet</p>
              </div>
            )}

            {/* Bugs List */}
            {!isLoading && filteredBugs.length > 0 && (
              <div className="space-y-4">
                {filteredBugs.map((bug) => (
              <div
                key={bug._id}
                className="bg-card rounded-xl border shadow-sm hover:shadow-md transition p-6 border-l-4"
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h2 className="text-xl font-bold text-foreground truncate break-words">{bug.title}</h2>
                      <Badge
                        variant={bug.severity === 'high' ? 'destructive' : 'secondary'}
                        className={`flex-shrink-0 ${
                          bug.severity === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                            : bug.severity === 'low'
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : ''
                        }`}
                      >
                        {bug.severity.toUpperCase()}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`flex items-center gap-1 flex-shrink-0 ${
                          bug.status === 'resolved'
                            ? 'bg-green-100 text-green-800 hover:bg-green-100'
                            : bug.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                              : ''
                        }`}
                      >
                        {bug.status === 'resolved' && <Check className="h-3 w-3" />}
                        <span>{bug.status.charAt(0).toUpperCase() + bug.status.slice(1)}</span>
                      </Badge>
                    </div>
                    <p className="text-foreground/80 whitespace-pre-wrap mb-3 break-words line-clamp-4">{bug.description}</p>
                    <div className="text-sm text-muted-foreground mb-3 break-words">
                      {bug.userName && (
                        <span>
                          <span className="font-medium">Reported by:</span> {bug.userName}
                          {bug.userEmail && <span className="text-muted-foreground/70"> ({bug.userEmail})</span>}
                          <span className="text-muted-foreground/50 mx-2">•</span>
                          <span>Reported: {new Date(bug.createdAt).toLocaleDateString()}</span>
                          <span className="text-muted-foreground/50 mx-2">•</span>
                          <span>Bug reference: {bug._id.slice(-8)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(bug)}
                    className="gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(bug._id)}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
              </div>
            )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Bug Report</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="resize-none"
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select
                  value={editForm.severity}
                  onValueChange={(value) => setEditForm({ ...editForm, severity: value as 'low' | 'medium' | 'high' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) => setEditForm({ ...editForm, status: value as 'open' | 'in-progress' | 'resolved' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-[#005596] hover:bg-[#004478]">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bug Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bug report? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
