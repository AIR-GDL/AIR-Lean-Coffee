'use client';

import { useState } from 'react';
import ChevronDownIcon from './icons/ChevronDownIcon';

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
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Filters</h2>
        <p className="text-sm text-gray-600">Total bugs: {bugCount}</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('search')}
          className="w-full flex items-center justify-between mb-3 p-2 hover:bg-gray-50 rounded-lg transition"
        >
          <span className="font-medium text-gray-700">Search</span>
          <ChevronDownIcon
            size={18}
            className={`transition-transform ${expandedSections.search ? 'rotate-180' : ''}`}
          />
        </button>
        {expandedSections.search && (
          <input
            type="text"
            placeholder="Search by title or content..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        )}
      </div>

      {/* Severity Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('severity')}
          className="w-full flex items-center justify-between mb-3 p-2 hover:bg-gray-50 rounded-lg transition"
        >
          <span className="font-medium text-gray-700">Severity</span>
          <ChevronDownIcon
            size={18}
            className={`transition-transform ${expandedSections.severity ? 'rotate-180' : ''}`}
          />
        </button>
        {expandedSections.severity && (
          <div className="space-y-2 ml-2">
            {['high', 'medium', 'low'].map((severity) => (
              <label key={severity} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.severity.includes(severity)}
                  onChange={() => handleSeverityChange(severity)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 capitalize">{severity}</span>
                <span
                  className={`ml-auto px-2 py-1 rounded text-xs font-medium ${
                    severity === 'high'
                      ? 'bg-red-100 text-red-800'
                      : severity === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                  }`}
                >
                  {severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '🟢'}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('status')}
          className="w-full flex items-center justify-between mb-3 p-2 hover:bg-gray-50 rounded-lg transition"
        >
          <span className="font-medium text-gray-700">Status</span>
          <ChevronDownIcon
            size={18}
            className={`transition-transform ${expandedSections.status ? 'rotate-180' : ''}`}
          />
        </button>
        {expandedSections.status && (
          <div className="space-y-2 ml-2">
            {['open', 'in-progress', 'resolved'].map((status) => (
              <label key={status} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.status.includes(status)}
                  onChange={() => handleStatusChange(status)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 capitalize">{status.replace('-', ' ')}</span>
                <span
                  className={`ml-auto px-2 py-1 rounded text-xs font-medium ${
                    status === 'resolved'
                      ? 'bg-green-100 text-green-800'
                      : status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {status === 'resolved' ? '✓' : status === 'in-progress' ? '⟳' : '○'}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Clear Filters */}
      {isFiltered && (
        <button
          onClick={handleClearFilters}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
