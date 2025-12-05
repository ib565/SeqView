'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import SequenceRow from './SequenceRow';
import TranslationControls from './TranslationControls';
import AnnotationForm from './AnnotationForm';
import AnnotationList from './AnnotationList';
import { SequenceType, Selection, Annotation } from '@/types';
import {
  splitIntoCodonGroups,
  splitCodonGroupsIntoRows,
  getRowStartPositionFromGroups,
  ReadingFrame,
} from '@/lib/translation';

interface SequenceViewerProps {
  sequence: string;
  type: SequenceType;
  annotations: Annotation[];
  onAnnotationsChange: (annotations: Annotation[]) => void;
  readOnly?: boolean;
  editToken?: string;
}

const BASES_PER_ROW = 60;

/**
 * Generate a unique ID for annotations
 */
function generateId(): string {
  return `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate the end position for a row
 */
function getRowEndPosition(rowGroups: { bases: string; position: number }[]): number {
  if (rowGroups.length === 0) return 0;
  const lastGroup = rowGroups[rowGroups.length - 1];
  return lastGroup.position + lastGroup.bases.length - 1;
}

/**
 * Main component that displays a sequence in formatted rows
 * Supports translation, drag selection, and annotations
 */
export default function SequenceViewer({
  sequence,
  type,
  annotations,
  onAnnotationsChange,
  readOnly = false,
  editToken,
}: SequenceViewerProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [readingFrame, setReadingFrame] = useState<ReadingFrame>(0);
  const [selection, setSelection] = useState<Selection>({ start: null, end: null });
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for scrolling to rows
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Split sequence into codon groups based on reading frame
  const codonGroups = splitIntoCodonGroups(sequence, readingFrame);
  
  // Split codon groups into display rows (~60 bases per row)
  const rows = splitCodonGroupsIntoRows(codonGroups, BASES_PER_ROW);

  /**
   * Handle mouse up to end drag selection
   */
  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        // If we have a valid selection, show the form
        if (selection.start !== null && selection.end !== null) {
          setShowAnnotationForm(true);
        }
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging, selection]);

  /**
   * Handle mouse down on a base - start drag selection
   */
  const handleBaseMouseDown = useCallback((position: number) => {
    if (readOnly) return;
    if (editingAnnotation) return;
    
    setIsDragging(true);
    setSelection({ start: position, end: position });
    setShowAnnotationForm(false);
  }, [readOnly, editingAnnotation]);

  /**
   * Handle mouse enter on a base - update selection while dragging
   */
  const handleBaseMouseEnter = useCallback((position: number) => {
    if (isDragging && selection.start !== null) {
      setSelection((prev) => ({ ...prev, end: position }));
    }
  }, [isDragging, selection.start]);


  /**
   * Create a new annotation or update existing one
   */
  const handleSubmitAnnotation = useCallback(
    async (annotationData: Omit<Annotation, 'id'>) => {
      if (readOnly) {
        setError('Cannot modify annotations in read-only mode');
        return;
      }

      if (!editToken) {
        setError('Edit token is required');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        if (editingAnnotation) {
          // Update existing annotation
          const response = await fetch(`/api/annotations/${editingAnnotation.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'x-edit-token': editToken,
            },
            body: JSON.stringify({
              start: annotationData.start,
              end: annotationData.end,
              label: annotationData.label,
              color: annotationData.color,
              type: annotationData.type,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update annotation');
          }

          const updatedDbAnnotation = await response.json();
          const updatedAnnotation: Annotation = {
            id: updatedDbAnnotation.id,
            start: updatedDbAnnotation.start_pos,
            end: updatedDbAnnotation.end_pos,
            label: updatedDbAnnotation.label,
            color: updatedDbAnnotation.color,
            type: updatedDbAnnotation.type || undefined,
          };

          const updatedAnnotations = annotations.map((a) =>
            a.id === editingAnnotation.id ? updatedAnnotation : a
          );
          onAnnotationsChange(updatedAnnotations);
          setEditingAnnotation(null);
        } else {
          // Create new annotation
          const response = await fetch('/api/annotations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-edit-token': editToken,
            },
            body: JSON.stringify({
              start: annotationData.start,
              end: annotationData.end,
              label: annotationData.label,
              color: annotationData.color,
              type: annotationData.type,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create annotation');
          }

          const newDbAnnotation = await response.json();
          const newAnnotation: Annotation = {
            id: newDbAnnotation.id,
            start: newDbAnnotation.start_pos,
            end: newDbAnnotation.end_pos,
            label: newDbAnnotation.label,
            color: newDbAnnotation.color,
            type: newDbAnnotation.type || undefined,
          };
          onAnnotationsChange([...annotations, newAnnotation]);
        }
        setSelection({ start: null, end: null });
        setShowAnnotationForm(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save annotation');
      } finally {
        setIsLoading(false);
      }
    },
    [readOnly, editToken, annotations, onAnnotationsChange, editingAnnotation]
  );

  /**
   * Cancel annotation creation/editing
   */
  const handleCancelAnnotation = useCallback(() => {
    setSelection({ start: null, end: null });
    setShowAnnotationForm(false);
    setEditingAnnotation(null);
  }, []);

  /**
   * Start editing an annotation
   */
  const handleEditAnnotation = useCallback((annotation: Annotation) => {
    setEditingAnnotation(annotation);
    setSelection({ start: annotation.start, end: annotation.end });
    setShowAnnotationForm(true);
  }, []);

  /**
   * Delete an annotation
   */
  const handleDeleteAnnotation = useCallback(
    async (id: string) => {
      if (readOnly) {
        setError('Cannot delete annotations in read-only mode');
        return;
      }

      if (!editToken) {
        setError('Edit token is required');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/annotations/${id}`, {
          method: 'DELETE',
          headers: {
            'x-edit-token': editToken,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete annotation');
        }

        onAnnotationsChange(annotations.filter((a) => a.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete annotation');
      } finally {
        setIsLoading(false);
      }
    },
    [readOnly, editToken, annotations, onAnnotationsChange]
  );

  /**
   * Scroll to an annotation's position
   */
  const handleAnnotationClick = useCallback((annotation: Annotation) => {
    // Find which row contains the start of the annotation
    const rowIndex = Math.floor((annotation.start - 1) / BASES_PER_ROW);
    const rowRef = rowRefs.current.get(rowIndex);
    if (rowRef) {
      rowRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Briefly highlight the selection to show where it is
      setSelection({ start: annotation.start, end: annotation.end });
      // Clear selection after a moment
      setTimeout(() => {
        setSelection({ start: null, end: null });
      }, 2000);
    }
  }, []);

  /**
   * Store ref for a row
   */
  const setRowRef = useCallback((index: number, ref: HTMLDivElement | null) => {
    if (ref) {
      rowRefs.current.set(index, ref);
    } else {
      rowRefs.current.delete(index);
    }
  }, []);

  // Calculate normalized selection for display
  const normalizedSelection: Selection = selection.start !== null && selection.end !== null
    ? {
        start: Math.min(selection.start, selection.end),
        end: Math.max(selection.start, selection.end),
      }
    : selection;

  return (
    <div className="w-full flex gap-6">
      {/* Main sequence viewer */}
      <div className="flex-1 min-w-0">
        {/* Header showing sequence info */}
        <div className="mb-4 pb-4 border-b border-gray-700">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm text-gray-400">Type:</span>
            <span className="px-3 py-1 bg-gray-800 rounded text-sm font-medium">
              {type}
            </span>
            <span className="text-sm text-gray-400">
              Length: {sequence.length.toLocaleString()} bases
            </span>
            {normalizedSelection.start !== null && !editingAnnotation && !readOnly && (
              <span className="text-sm text-blue-400">
                {normalizedSelection.end !== null
                  ? `Selected: ${normalizedSelection.start}-${normalizedSelection.end} (${normalizedSelection.end - normalizedSelection.start + 1} bp)`
                  : `Selection start: ${normalizedSelection.start}`}
              </span>
            )}
            {readOnly && (
              <span className="text-sm text-gray-500">Read-only mode</span>
            )}
            {isLoading && (
              <span className="text-sm text-gray-500">Saving...</span>
            )}
          </div>
        </div>

        {/* Translation controls */}
        <TranslationControls
          showTranslation={showTranslation}
          readingFrame={readingFrame}
          onToggleTranslation={() => setShowTranslation(!showTranslation)}
          onFrameChange={setReadingFrame}
        />

        {/* Sequence rows with integrated annotation tracks */}
        <div className="space-y-3">
          {rows.map((rowGroups, index) => {
            const rowStart = getRowStartPositionFromGroups(rowGroups);
            const rowEnd = getRowEndPosition(rowGroups);
            
            return (
              <SequenceRow
                key={index}
                ref={(ref) => setRowRef(index, ref)}
                codonGroups={rowGroups}
                startPosition={rowStart}
                endPosition={rowEnd}
                type={type}
                showTranslation={showTranslation}
                selection={normalizedSelection}
                onBaseMouseDown={handleBaseMouseDown}
                onBaseMouseEnter={handleBaseMouseEnter}
                annotations={annotations}
                onAnnotationClick={handleAnnotationClick}
              />
            );
          })}
        </div>
      </div>

      {/* Annotations sidebar */}
      <div className="w-72 shrink-0">
        <div className="sticky top-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
              <h3 className="font-semibold text-gray-200">
                Annotations
                {annotations.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({annotations.length})
                  </span>
                )}
              </h3>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              <AnnotationList
                annotations={annotations}
                onAnnotationClick={handleAnnotationClick}
                onEditAnnotation={readOnly ? undefined : handleEditAnnotation}
                onDeleteAnnotation={readOnly ? undefined : handleDeleteAnnotation}
                readOnly={readOnly}
                editToken={editToken}
              />
            </div>
          </div>

          {/* Help text */}
          {!readOnly && (
            <p className="mt-3 text-xs text-gray-500 px-1">
              Drag across bases to select a region for annotation.
            </p>
          )}
          {error && (
            <div className="mt-3 p-2 bg-red-900/30 border border-red-700 rounded text-xs text-red-300">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Annotation form modal (create or edit) */}
      {showAnnotationForm && normalizedSelection.start !== null && normalizedSelection.end !== null && (
        <AnnotationForm
          selection={{ start: normalizedSelection.start, end: normalizedSelection.end }}
          editingAnnotation={editingAnnotation || undefined}
          onSubmit={handleSubmitAnnotation}
          onCancel={handleCancelAnnotation}
        />
      )}
    </div>
  );
}
