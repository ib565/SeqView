'use client';

import { useState, useEffect } from 'react';
import { Annotation, Comment, dbCommentToComment } from '@/types';
import CommentPanel from './CommentPanel';

interface AnnotationListProps {
  annotations: Annotation[];
  onAnnotationClick: (annotation: Annotation) => void;
  onEditAnnotation?: (annotation: Annotation) => void;
  onDeleteAnnotation?: (id: string) => void;
  readOnly?: boolean;
  editToken?: string;
}

/**
 * Sidebar panel showing all annotations
 * Click an annotation to scroll to that region
 * Click chevron to expand/collapse comments
 */
export default function AnnotationList({
  annotations,
  onAnnotationClick,
  onEditAnnotation,
  onDeleteAnnotation,
  readOnly = false,
  editToken,
}: AnnotationListProps) {
  const [expandedAnnotations, setExpandedAnnotations] = useState<Set<string>>(new Set());
  const [commentsMap, setCommentsMap] = useState<Map<string, Comment[]>>(new Map());
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());

  // Fetch comments when annotation is expanded
  useEffect(() => {
    const fetchComments = async (annotationId: string) => {
      // Check if we already have comments or are loading them
      if (commentsMap.has(annotationId) || loadingComments.has(annotationId)) {
        return;
      }

      setLoadingComments((prev) => new Set(prev).add(annotationId));

      try {
        const response = await fetch(`/api/annotations/${annotationId}/comments`);
        if (response.ok) {
          const comments = await response.json();
          setCommentsMap((prev) => {
            const newMap = new Map(prev);
            newMap.set(annotationId, comments);
            return newMap;
          });
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      } finally {
        setLoadingComments((prev) => {
          const newSet = new Set(prev);
          newSet.delete(annotationId);
          return newSet;
        });
      }
    };

    expandedAnnotations.forEach((annotationId) => {
      fetchComments(annotationId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedAnnotations]);

  const toggleExpanded = (annotationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedAnnotations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(annotationId)) {
        newSet.delete(annotationId);
      } else {
        newSet.add(annotationId);
      }
      return newSet;
    });
  };

  const handleAddComment = async (annotationId: string, author: string, text: string) => {
    if (!editToken) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-edit-token': editToken,
        },
        body: JSON.stringify({
          annotation_id: annotationId,
          author,
          text,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const newComment = await response.json();
      const comment = dbCommentToComment(newComment);

      // Update comments map
      setCommentsMap((prev) => {
        const newMap = new Map(prev);
        const existingComments = newMap.get(annotationId) || [];
        newMap.set(annotationId, [...existingComments, comment]);
        return newMap;
      });
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!editToken) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'x-edit-token': editToken,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      // Remove comment from all annotation comment lists
      setCommentsMap((prev) => {
        const newMap = new Map();
        prev.forEach((comments, annotationId) => {
          newMap.set(annotationId, comments.filter((c) => c.id !== commentId));
        });
        return newMap;
      });
    } catch (error) {
      console.error('Failed to delete comment:', error);
      throw error;
    }
  };

  if (annotations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        <p className="mb-2">No annotations yet</p>
        <p className="text-xs">
          Click on a base in the sequence to start selecting a region
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-800">
      {annotations.map((annotation) => {
        const isExpanded = expandedAnnotations.has(annotation.id);
        const comments = commentsMap.get(annotation.id) || [];
        const isLoading = loadingComments.has(annotation.id);

        return (
          <div key={annotation.id} className="transition-colors">
            <div
              className="p-3 hover:bg-gray-800/50 cursor-pointer group"
              onClick={() => onAnnotationClick(annotation)}
            >
              <div className="flex items-start gap-2">
                {/* Chevron for expand/collapse */}
                <button
                  onClick={(e) => toggleExpanded(annotation.id, e)}
                  className="shrink-0 mt-0.5 text-gray-500 hover:text-gray-300 transition-colors"
                  title={isExpanded ? 'Collapse comments' : 'Expand comments'}
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Color indicator */}
                <div
                  className="w-3 h-3 rounded-full mt-1 shrink-0"
                  style={{ backgroundColor: annotation.color }}
                />
                
                <div className="flex-1 min-w-0">
                  {/* Label with comment count */}
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-gray-200 truncate">
                      {annotation.label}
                    </div>
                    {comments.length > 0 && (
                      <span className="px-1.5 py-0.5 bg-gray-700 text-gray-400 text-xs rounded">
                        {comments.length}
                      </span>
                    )}
                  </div>
                  
                  {/* Position range */}
                  <div className="text-xs text-gray-500 font-mono">
                    {annotation.start} - {annotation.end}
                    <span className="ml-2 text-gray-600">
                      ({annotation.end - annotation.start + 1} bp)
                    </span>
                  </div>
                  
                  {/* Type badge */}
                  {annotation.type && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">
                      {annotation.type}
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                {!readOnly && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    {/* Edit button */}
                    {onEditAnnotation && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditAnnotation(annotation);
                        }}
                        className="p-1 text-gray-500 hover:text-blue-400 transition-colors"
                        title="Edit annotation"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    )}

                    {/* Delete button */}
                    {onDeleteAnnotation && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteAnnotation(annotation.id);
                        }}
                        className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                        title="Delete annotation"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Expanded comments section */}
            {isExpanded && (
              <div className="px-3 pb-3">
                {isLoading ? (
                  <div className="text-xs text-gray-500 text-center py-2">
                    Loading comments...
                  </div>
                ) : (
                  <CommentPanel
                    annotationId={annotation.id}
                    comments={comments}
                    onAddComment={(author, text) => handleAddComment(annotation.id, author, text)}
                    onDeleteComment={!readOnly && editToken ? handleDeleteComment : undefined}
                    readOnly={readOnly}
                    editToken={editToken}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
