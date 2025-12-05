'use client';

import { useState } from 'react';

interface ShareLinksProps {
  viewSlug: string;
  editToken?: string;
  showEditLink?: boolean;
}

/**
 * Compact component for displaying and copying share links
 */
export default function ShareLinks({ viewSlug, editToken, showEditLink = false }: ShareLinksProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedView, setCopiedView] = useState(false);
  const [copiedEdit, setCopiedEdit] = useState(false);

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };

  const viewUrl = `${getBaseUrl()}/view/${viewSlug}`;
  const editUrl = editToken ? `${getBaseUrl()}/edit/${editToken}` : '';

  const copyToClipboard = async (text: string, type: 'view' | 'edit') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'view') {
        setCopiedView(true);
        setTimeout(() => setCopiedView(false), 2000);
      } else {
        setCopiedEdit(true);
        setTimeout(() => setCopiedEdit(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback: select the text
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        if (type === 'view') {
          setCopiedView(true);
          setTimeout(() => setCopiedView(false), 2000);
        } else {
          setCopiedEdit(true);
          setTimeout(() => setCopiedEdit(false), 2000);
        }
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 flex items-center gap-1.5"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        <span>Share</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close on click outside */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown menu */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-20 p-3 space-y-2">
            {/* View Link */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">View Link</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={viewUrl}
                  readOnly
                  className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-300 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={() => copyToClipboard(viewUrl, 'view')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                >
                  {copiedView ? '✓' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Edit Link (only if showEditLink is true) */}
            {showEditLink && editToken && (
              <div>
                <label className="block text-xs text-gray-400 mb-1">Edit Link</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={editUrl}
                    readOnly
                    className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-300 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => copyToClipboard(editUrl, 'edit')}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded transition-colors"
                  >
                    {copiedEdit ? '✓' : 'Copy'}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Keep private - allows editing
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

