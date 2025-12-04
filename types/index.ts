export type SequenceType = 'DNA' | 'RNA';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  type?: SequenceType;
  sequence?: string;
}

