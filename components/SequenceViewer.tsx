'use client';

import { useState, useRef, useCallback } from 'react';
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
}

const BASES_PER_ROW = 60;

/**
 * Generate a unique ID for annotations
 */
function generateId(): string {
  return `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Main component that displays a sequence in formatted rows
 * Supports translation, selection, and annotations
 */
export default function SequenceViewer({
  sequence,
  type,
  annotations,
  onAnnotationsChange,
}: SequenceViewerProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [readingFrame, setReadingFrame] = useState<ReadingFrame>(0);
  const [selection, setSelection] = useState<Selection>({ start: null, end: null });
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);

  // Refs for scrolling to rows
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Split sequence into codon groups based on reading frame
  const codonGroups = splitIntoCodonGroups(sequence, readingFrame);
  
  // Split codon groups into display rows (~60 bases per row)
  const rows = splitCodonGroupsIntoRows(codonGroups, BASES_PER_ROW);

  /**
   * Handle clicking on a base to build selection
   */
  const handleBaseClick = useCallback((position: number) => {
    // Don't start new selection if editing
    if (editingAnnotation) return;

    setSelection((prev) => {
      if (prev.start === null) {
        // First click: set start
        return { start: position, end: null };
      } else if (prev.end === null) {
        // Second click: set end and show form
        const start = Math.min(prev.start, position);
        const end = Math.max(prev.start, position);
        setShowAnnotationForm(true);
        return { start, end };
      } else {
        // Third click: reset and start new selection
        return { start: position, end: null };
      }
    });
  }, [editingAnnotation]);

  /**
   * Create a new annotation or update existing one
   */
  const handleSubmitAnnotation = useCallback(
    (annotationData: Omit<Annotation, 'id'>) => {
      if (editingAnnotation) {
        // Update existing annotation
        const updatedAnnotations = annotations.map((a) =>
          a.id === editingAnnotation.id
            ? { ...annotationData, id: editingAnnotation.id }
            : a
        );
        onAnnotationsChange(updatedAnnotations);
        setEditingAnnotation(null);
      } else {
        // Create new annotation
        const newAnnotation: Annotation = {
          ...annotationData,
          id: generateId(),
        };
        onAnnotationsChange([...annotations, newAnnotation]);
      }
      setSelection({ start: null, end: null });
      setShowAnnotationForm(false);
    },
    [annotations, onAnnotationsChange, editingAnnotation]
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
    (id: string) => {
      onAnnotationsChange(annotations.filter((a) => a.id !== id));
    },
    [annotations, onAnnotationsChange]
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
            {selection.start !== null && !editingAnnotation && (
              <span className="text-sm text-blue-400">
                {selection.end !== null
                  ? `Selected: ${selection.start}-${selection.end} (${selection.end - selection.start + 1} bp)`
                  : `Selection start: ${selection.start} (click another base to complete)`}
              </span>
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

        {/* Sequence rows with codon groups */}
        <div className="space-y-2">
          {rows.map((rowGroups, index) => (
            <SequenceRow
              key={index}
              ref={(ref) => setRowRef(index, ref)}
              codonGroups={rowGroups}
              startPosition={getRowStartPositionFromGroups(rowGroups)}
              type={type}
              showTranslation={showTranslation}
              selection={selection}
              annotations={annotations}
              onBaseClick={handleBaseClick}
            />
          ))}
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
                onEditAnnotation={handleEditAnnotation}
                onDeleteAnnotation={handleDeleteAnnotation}
              />
            </div>
          </div>

          {/* Help text */}
          <p className="mt-3 text-xs text-gray-500 px-1">
            Click on a base to start selecting, then click another base to complete the selection and create an annotation.
          </p>
        </div>
      </div>

      {/* Annotation form modal (create or edit) */}
      {showAnnotationForm && selection.start !== null && selection.end !== null && (
        <AnnotationForm
          selection={{ start: selection.start, end: selection.end }}
          editingAnnotation={editingAnnotation || undefined}
          onSubmit={handleSubmitAnnotation}
          onCancel={handleCancelAnnotation}
        />
      )}
    </div>
  );
}
