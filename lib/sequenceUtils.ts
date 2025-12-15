import { SequenceType, ValidationResult } from '@/types';

const MAX_SEQUENCE_LENGTH = 100000;

/**
 * Validates and cleans a DNA/RNA sequence input
 * - Strips whitespace and newlines
 * - Converts to uppercase
 * - Detects DNA (contains T) vs RNA (contains U)
 * - Rejects mixed T+U sequences
 * - Rejects invalid characters
 * - Enforces max length
 */
export function validateSequence(input: string): ValidationResult {
  if (!input || input.trim().length === 0) {
    return {
      valid: false,
      error: 'Sequence cannot be empty',
    };
  }

  // Clean: remove whitespace, newlines, convert to uppercase
  const cleaned = input.replace(/\s+/g, '').toUpperCase();

  if (cleaned.length === 0) {
    return {
      valid: false,
      error: 'Sequence contains only whitespace',
    };
  }

  // Check length
  if (cleaned.length > MAX_SEQUENCE_LENGTH) {
    return {
      valid: false,
      error: `Sequence exceeds maximum length of ${MAX_SEQUENCE_LENGTH.toLocaleString()} bases`,
    };
  }

  // Check for invalid characters (only A, T, G, C, U allowed)
  const validChars = /^[ATGCU]+$/;
  if (!validChars.test(cleaned)) {
    const invalidChars = cleaned
      .split('')
      .filter((char) => !['A', 'T', 'G', 'C', 'U'].includes(char))
      .filter((char, index, arr) => arr.indexOf(char) === index); // unique
    return {
      valid: false,
      error: `Invalid characters found: ${invalidChars.join(', ')}. Only A, T, G, C (DNA) or A, U, G, C (RNA) are allowed.`,
    };
  }

  // Detect type: presence of T → DNA, presence of U → RNA
  const hasT = cleaned.includes('T');
  const hasU = cleaned.includes('U');

  if (hasT && hasU) {
    return {
      valid: false,
      error: 'Sequence cannot contain both T (DNA) and U (RNA). Please use one type only.',
    };
  }

  const type: SequenceType = hasU ? 'RNA' : 'DNA';

  return {
    valid: true,
    type,
    sequence: cleaned,
  };
}

/**
 * Result of validating a FASTA input.
 * Extends the normal ValidationResult with an optional name from the header.
 */
export interface FastaValidationResult extends ValidationResult {
  nameFromHeader?: string;
}

/**
 * Validates a FASTA input (single-record, first record only)
 * - Uses first header line (if present) as optional name
 * - Uses only the first record; subsequent records are ignored
 * - Delegates sequence validation to validateSequence
 */
export function validateFasta(input: string): FastaValidationResult {
  if (!input || input.trim().length === 0) {
    return {
      valid: false,
      error: 'No sequence found in FASTA file',
    };
  }

  const lines = input.split(/\r?\n/);

  let header: string | undefined;
  const sequenceLines: string[] = [];
  let inFirstRecord = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    if (line.startsWith('>')) {
      // Starting a header
      if (!inFirstRecord && sequenceLines.length === 0) {
        // First header, attach name and start first record
        header = line.slice(1).trim() || undefined;
        inFirstRecord = true;
        continue;
      }

      // Any subsequent header means we're at the next record → stop
      break;
    }

    // Sequence line
    sequenceLines.push(line);
    // Mark that we've started reading sequence for the first record
    if (!inFirstRecord) {
      inFirstRecord = true;
    }
  }

  const rawSequence = sequenceLines.join('');

  if (!rawSequence) {
    return {
      valid: false,
      error: 'No sequence found in FASTA file',
    };
  }

  const validation = validateSequence(rawSequence) as FastaValidationResult;
  validation.nameFromHeader = header;
  return validation;
}

/**
 * Splits a sequence into rows of specified length (default 60)
 */
export function splitIntoRows(sequence: string, basesPerRow: number = 60): string[] {
  const rows: string[] = [];
  for (let i = 0; i < sequence.length; i += basesPerRow) {
    rows.push(sequence.slice(i, i + basesPerRow));
  }
  return rows;
}

/**
 * Gets the starting position for a row (1-indexed)
 */
export function getRowStartPosition(rowIndex: number, basesPerRow: number = 60): number {
  return rowIndex * basesPerRow + 1;
}

