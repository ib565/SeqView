'use client';

import { Annotation } from '@/types';

interface AnnotationListProps {
  annotations: Annotation[];
  onAnnotationClick: (annotation: Annotation) => void;
  onEditAnnotation?: (annotation: Annotation) => void;
  onDeleteAnnotation?: (id: string) => void;
  readOnly?: boolean;
}

/**
 * Sidebar panel showing all annotations
 * Click an annotation to scroll to that region
 */
export default function AnnotationList({
  annotations,
  onAnnotationClick,
  onEditAnnotation,
  onDeleteAnnotation,
  readOnly = false,
}: AnnotationListProps) {
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
      {annotations.map((annotation) => (
        <div
          key={annotation.id}
          className="p-3 hover:bg-gray-800/50 cursor-pointer transition-colors group"
          onClick={() => onAnnotationClick(annotation)}
        >
          <div className="flex items-start gap-2">
            {/* Color indicator */}
            <div
              className="w-3 h-3 rounded-full mt-1 shrink-0"
              style={{ backgroundColor: annotation.color }}
            />
            
            <div className="flex-1 min-w-0">
              {/* Label */}
              <div className="font-medium text-gray-200 truncate">
                {annotation.label}
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
      ))}
    </div>
  );
}
