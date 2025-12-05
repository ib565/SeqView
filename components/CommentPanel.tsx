'use client';

import { useState, FormEvent } from 'react';
import { Comment } from '@/types';

interface CommentPanelProps {
  annotationId: string;
  comments: Comment[];
  onAddComment: (author: string, text: string) => Promise<void>;
  onDeleteComment?: (id: string) => Promise<void>;
  readOnly?: boolean;
  editToken?: string;
}

/**
 * Format timestamp to relative time or date
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
 * Panel showing comments for an annotation with ability to add new ones
 */
export default function CommentPanel({
  annotationId,
  comments,
  onAddComment,
  onDeleteComment,
  readOnly = false,
  editToken,
}: CommentPanelProps) {
  const [author, setAuthor] = useState('Anonymous');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddComment(author.trim() || 'Anonymous', text.trim());
      setText('');
      // Keep author name for next comment
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!onDeleteComment) return;
    
    setIsDeleting(commentId);
    try {
      await onDeleteComment(commentId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="mt-2 border-t border-gray-800 pt-2">
      {/* Comments list */}
      <div className="space-y-3 mb-3">
        {comments.length === 0 ? (
          <div className="text-xs text-gray-500 text-center py-2">
            No comments yet
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="group relative bg-gray-800/50 rounded p-2 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-200">
                      {comment.author}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs whitespace-pre-wrap break-words">
                    {comment.text}
                  </p>
                </div>
                
                {/* Delete button */}
                {!readOnly && editToken && onDeleteComment && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={isDeleting === comment.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-500 hover:text-red-400 disabled:opacity-50"
                    title="Delete comment"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add comment form */}
      {!readOnly && editToken && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name"
            className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            rows={2}
            className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600 resize-none"
          />
          <button
            type="submit"
            disabled={!text.trim() || isSubmitting}
            className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs rounded transition-colors"
          >
            {isSubmitting ? 'Adding...' : 'Add Comment'}
          </button>
        </form>
      )}
    </div>
  );
}

