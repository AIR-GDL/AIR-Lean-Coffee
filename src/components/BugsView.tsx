'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Bug, Check, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
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

interface BugFilters {
  severity: string[];
  status: string[];
  searchQuery: string;
}

interface BugsViewProps {
  filters: BugFilters;
}

export default function BugsView({ filters }: BugsViewProps) {
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
      toast.error('Failed to update bug');
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

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <header className="flex-shrink-0 bg-background sticky top-0 flex h-14 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Bug Reports</h1>
        <span className="text-sm text-muted-foreground ml-2">
          ({filteredBugs.length} of {bugs.length})
        </span>
      </header>

      <main className="flex-1 overflow-auto min-h-0 p-4">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-xl font-semibold text-muted-foreground">Loading bugs...</div>
          </div>
        )}

        {!isLoading && bugs.length === 0 && (
          <div className="bg-card rounded-xl border shadow-sm p-12 text-center">
            <Bug className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground mt-4 text-lg">No bug reports yet</p>
          </div>
        )}

        {!isLoading && filteredBugs.length === 0 && bugs.length > 0 && (
          <div className="bg-card rounded-xl border shadow-sm p-12 text-center">
            <Bug className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground mt-4 text-lg">No bugs match your filters</p>
          </div>
        )}

        {!isLoading && filteredBugs.length > 0 && (
          <div className="space-y-4 max-w-4xl mx-auto">
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

                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(bug)} className="gap-2">
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
      </main>

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
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} className="bg-[#005596] hover:bg-[#004478]">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
