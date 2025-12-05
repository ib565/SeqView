export type SequenceType = 'DNA' | 'RNA';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  type?: SequenceType;
  sequence?: string;
}

// Annotation types
export type AnnotationType = 'gene' | 'promoter' | 'CDS' | 'misc';

export interface Annotation {
  id: string;
  start: number;       // 1-indexed, inclusive
  end: number;         // 1-indexed, inclusive
  label: string;
  color: string;       // hex color
  type?: AnnotationType;
}

// Selection state for creating annotations
export interface Selection {
  start: number | null;
  end: number | null;
}

// Preset annotation colors
export const ANNOTATION_COLORS = [
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
] as const;

export const ANNOTATION_TYPES: { label: string; value: AnnotationType }[] = [
  { label: 'Gene', value: 'gene' },
  { label: 'Promoter', value: 'promoter' },
  { label: 'CDS', value: 'CDS' },
  { label: 'Misc', value: 'misc' },
];
