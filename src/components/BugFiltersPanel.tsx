'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface BugFilters {
  severity: string[];
  status: string[];
  searchQuery: string;
}

interface BugReport {
  _id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved';
}

interface BugFiltersPanelProps {
  bugs: BugReport[];
  filters: BugFilters;
  onFiltersChange: (filters: BugFilters) => void;
  bugCount: number;
}

export default function BugFiltersPanel({ filters, onFiltersChange, bugCount }: BugFiltersPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    severity: true,
    status: true,
    search: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSeverityChange = (severity: string) => {
    const newSeverities = filters.severity.includes(severity)
      ? filters.severity.filter((s) => s !== severity)
      : [...filters.severity, severity];
    onFiltersChange({ ...filters, severity: newSeverities });
  };

  const handleStatusChange = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    onFiltersChange({ ...filters, status: newStatuses });
  };

  const handleSearchChange = (query: string) => {
    onFiltersChange({ ...filters, searchQuery: query });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      severity: [],
      status: [],
      searchQuery: '',
    });
  };

  const isFiltered = filters.severity.length > 0 || filters.status.length > 0 || filters.searchQuery.length > 0;

  return (
    <div className="w-64 bg-card rounded-lg border shadow-sm p-4 h-fit sticky top-4">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-foreground mb-2">Filters</h2>
        <p className="text-sm text-muted-foreground">Total bugs: {bugCount}</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => toggleSection('search')}
          className="w-full flex items-center justify-between mb-3 px-2"
        >
          <span className="font-medium">Search</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${expandedSections.search ? 'rotate-180' : ''}`}
          />
        </Button>
        {expandedSections.search && (
          <Input
            type="text"
            placeholder="Search by title or content..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="text-sm"
          />
        )}
      </div>

      {/* Severity Filter */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => toggleSection('severity')}
          className="w-full flex items-center justify-between mb-3 px-2"
        >
          <span className="font-medium">Severity</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${expandedSections.severity ? 'rotate-180' : ''}`}
          />
        </Button>
        {expandedSections.severity && (
          <div className="space-y-3 ml-2">
            {['high', 'medium', 'low'].map((severity) => (
              <label key={severity} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={filters.severity.includes(severity)}
                  onCheckedChange={() => handleSeverityChange(severity)}
                />
                <span className="text-sm text-foreground capitalize">{severity}</span>
                <Badge
                  variant={severity === 'high' ? 'destructive' : 'secondary'}
                  className={`ml-auto ${
                    severity === 'medium'
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                      : severity === 'low'
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : ''
                  }`}
                >
                  {severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '🟢'}
                </Badge>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => toggleSection('status')}
          className="w-full flex items-center justify-between mb-3 px-2"
        >
          <span className="font-medium">Status</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${expandedSections.status ? 'rotate-180' : ''}`}
          />
        </Button>
        {expandedSections.status && (
          <div className="space-y-3 ml-2">
            {['open', 'in-progress', 'resolved'].map((status) => (
              <label key={status} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={filters.status.includes(status)}
                  onCheckedChange={() => handleStatusChange(status)}
                />
                <span className="text-sm text-foreground capitalize">{status.replace('-', ' ')}</span>
                <Badge
                  variant="secondary"
                  className={`ml-auto ${
                    status === 'resolved'
                      ? 'bg-green-100 text-green-800 hover:bg-green-100'
                      : status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                        : ''
                  }`}
                >
                  {status === 'resolved' ? '✓' : status === 'in-progress' ? '⟳' : '○'}
                </Badge>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Clear Filters */}
      {isFiltered && (
        <Button
          variant="outline"
          onClick={handleClearFilters}
          className="w-full"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
}
