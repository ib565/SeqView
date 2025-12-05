'use client';

import { useState, useEffect } from 'react';
import {
  Annotation,
  AnnotationType,
  ANNOTATION_COLORS,
  ANNOTATION_TYPES,
} from '@/types';

interface AnnotationFormProps {
  selection: { start: number; end: number };
  editingAnnotation?: Annotation; // If provided, we're in edit mode
  onSubmit: (annotation: Omit<Annotation, 'id'>) => void;
  onCancel: () => void;
}

/**
 * Form for creating or editing an annotation
 */
export default function AnnotationForm({
  selection,
  editingAnnotation,
  onSubmit,
  onCancel,
}: AnnotationFormProps) {
  const [label, setLabel] = useState('');
  const [color, setColor] = useState<string>(ANNOTATION_COLORS[0].value);
  const [type, setType] = useState<AnnotationType | ''>('');

  const isEditing = !!editingAnnotation;

  // Pre-fill form when editing
  useEffect(() => {
    if (editingAnnotation) {
      setLabel(editingAnnotation.label);
      setColor(editingAnnotation.color);
      setType(editingAnnotation.type || '');
    }
  }, [editingAnnotation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    onSubmit({
      start: selection.start,
      end: selection.end,
      label: label.trim(),
      color,
      type: type || undefined,
    });

    // Reset form
    setLabel('');
    setColor(ANNOTATION_COLORS[0].value);
    setType('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          {isEditing ? 'Edit Annotation' : 'Create Annotation'}
        </h3>
        
        {/* Selection info */}
        <div className="mb-4 p-3 bg-gray-800 rounded text-sm text-gray-300">
          Region: <span className="font-mono font-medium">
            {selection.start} - {selection.end}
          </span>
          <span className="text-gray-500 ml-2">
            ({selection.end - selection.start + 1} bases)
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Label input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Label <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Promoter region"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {ANNOTATION_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c.value
                      ? 'border-white scale-110'
                      : 'border-transparent hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Type dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Type <span className="text-gray-500">(optional)</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AnnotationType | '')}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select type...</option>
              {ANNOTATION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!label.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors"
            >
              {isEditing ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
