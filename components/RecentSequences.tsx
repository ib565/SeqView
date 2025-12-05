'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRecentSequences, clearRecentSequences, RecentSequence } from '@/lib/recentSequences';

/**
 * Format timestamp to relative time
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Component displaying recent sequences from localStorage
 */
export default function RecentSequences() {
  const [recentSequences, setRecentSequences] = useState<RecentSequence[]>([]);

  useEffect(() => {
    // Load recent sequences on mount
    const sequences = getRecentSequences();
    setRecentSequences(sequences);
  }, []);

  const handleClear = () => {
    if (confirm('Clear all recent sequences?')) {
      clearRecentSequences();
      setRecentSequences([]);
    }
  };

  if (recentSequences.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-200">Recent Sequences</h2>
        <button
          onClick={handleClear}
          className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
        >
          Clear
        </button>
      </div>
      
      <div className="space-y-2">
        {recentSequences.map((seq) => (
          <div
            key={seq.edit_token}
            className="flex items-center justify-between p-3 bg-gray-800/50 rounded hover:bg-gray-800 transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-200 truncate">
                {seq.name || 'Untitled Sequence'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {seq.length.toLocaleString()} bases • {formatTimestamp(seq.created_at)}
              </div>
            </div>
            
            <div className="flex gap-2 ml-4 shrink-0">
              <Link
                href={`/view/${seq.view_slug}`}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs rounded transition-colors"
              >
                View
              </Link>
              <Link
                href={`/edit/${seq.edit_token}`}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

