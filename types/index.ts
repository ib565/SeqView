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

// Database types
export interface DbSequence {
  id: string;
  name: string | null;
  nucleotides: string;
  type: SequenceType;
  view_slug: string;
  edit_token: string;
  created_at: string;
}

export interface DbAnnotation {
  id: string;
  sequence_id: string;
  start_pos: number;
  end_pos: number;
  label: string;
  color: string;
  type: AnnotationType | null;
  created_at: string;
}

// API request/response types
export interface CreateSequenceRequest {
  nucleotides: string;
  type: SequenceType;
  name?: string;
}

export interface CreateSequenceResponse {
  view_slug: string;
  edit_token: string;
}

export interface SequenceWithAnnotations {
  sequence: DbSequence;
  annotations: DbAnnotation[];
}

// Comment types
export interface Comment {
  id: string;
  annotation_id: string;
  author: string;
  text: string;
  created_at: string;
}

export interface DbComment {
  id: string;
  annotation_id: string;
  author: string;
  text: string;
  created_at: string;
}

// Helper functions to convert between client and DB types
export function dbAnnotationToAnnotation(dbAnn: DbAnnotation): Annotation {
  return {
    id: dbAnn.id,
    start: dbAnn.start_pos,
    end: dbAnn.end_pos,
    label: dbAnn.label,
    color: dbAnn.color,
    type: dbAnn.type || undefined,
  };
}

export function annotationToDbAnnotation(
  ann: Omit<Annotation, 'id'>,
  sequenceId: string
): Omit<DbAnnotation, 'id' | 'created_at'> {
  return {
    sequence_id: sequenceId,
    start_pos: ann.start,
    end_pos: ann.end,
    label: ann.label,
    color: ann.color,
    type: ann.type || null,
  };
}

export function dbCommentToComment(dbComment: DbComment): Comment {
  return {
    id: dbComment.id,
    annotation_id: dbComment.annotation_id,
    author: dbComment.author,
    text: dbComment.text,
    created_at: dbComment.created_at,
  };
}

export function commentToDbComment(
  comment: Omit<Comment, 'id' | 'created_at'>
): Omit<DbComment, 'id' | 'created_at'> {
  return {
    annotation_id: comment.annotation_id,
    author: comment.author,
    text: comment.text,
  };
}