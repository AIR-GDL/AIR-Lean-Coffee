'use client';

import Modal from './Modal';

interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.1.0',
    date: '2025-10-23',
    changes: [
      'Upgraded to Next.js 16.0.0',
      'Updated React to 19.2.0',
      'Added feedback and bug reporting system',
      'Added changelog tracking',
      'Improved TypeScript configuration',
      'Enhanced accessibility features',
    ],
  },
  {
    version: '1.0.0',
    date: '2025-10-20',
    changes: [
      'Initial release of AIR Lean Coffee',
      'Implemented Lean Coffee board with drag-and-drop',
      'Added voting system with 3 votes per user',
      'Integrated timer for discussions',
      'Added discussion history tracking',
      'User registration and session management',
      'Real-time participant list',
    ],
  },
];

export default function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Changelog"
    >
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {CHANGELOG.map((entry) => (
          <div key={entry.version} className="border-l-4 border-blue-500 pl-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900">v{entry.version}</h3>
              <span className="text-sm text-gray-500">{entry.date}</span>
            </div>
            <ul className="space-y-2">
              {entry.changes.map((change, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition"
          style={{ backgroundColor: '#005596' }}
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
