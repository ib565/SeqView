import { SequenceType } from '@/types';
import { translateCodon } from './codonTable';

export type ReadingFrame = 0 | 1 | 2;

export interface CodonGroup {
  bases: string; // 1-3 bases
  aminoAcid: string | null; // null if incomplete codon
  position: number; // 1-indexed start position
  isOrphan: boolean; // true if this is an orphan base (frame 1/2)
}

/**
 * Split sequence into codon groups for a given reading frame
 * 
 * Frame 0: starts at position 1 (ATG|GCA|TTA...)
 * Frame 1: starts at position 2 (A|TGG|CAT...)
 * Frame 2: starts at position 3 (AT|GGC|ATT...)
 */
export function splitIntoCodonGroups(
  sequence: string,
  frame: ReadingFrame
): CodonGroup[] {
  const groups: CodonGroup[] = [];
  
  // Handle orphan bases at the start (for frames 1 and 2)
  if (frame === 1) {
    if (sequence.length > 0) {
      groups.push({
        bases: sequence[0],
        aminoAcid: null,
        position: 1,
        isOrphan: true,
      });
    }
  } else if (frame === 2) {
    if (sequence.length > 0) {
      groups.push({
        bases: sequence[0],
        aminoAcid: null,
        position: 1,
        isOrphan: true,
      });
    }
    if (sequence.length > 1) {
      groups.push({
        bases: sequence[1],
        aminoAcid: null,
        position: 2,
        isOrphan: true,
      });
    }
  }
  
  // Process codons starting from the frame offset
  const startIndex = frame;
  for (let i = startIndex; i < sequence.length; i += 3) {
    const codon = sequence.slice(i, i + 3);
    const position = i + 1; // 1-indexed
    
    if (codon.length === 3) {
      // Complete codon
      groups.push({
        bases: codon,
        aminoAcid: translateCodon(codon),
        position,
        isOrphan: false,
      });
    } else if (codon.length > 0) {
      // Incomplete codon at the end
      groups.push({
        bases: codon,
        aminoAcid: null,
        position,
        isOrphan: false,
      });
    }
  }
  
  return groups;
}

/**
 * Split codon groups into rows (for display)
 * Each row should contain ~20 codons (60 bases) for clean alignment
 */
export function splitCodonGroupsIntoRows(
  groups: CodonGroup[],
  basesPerRow: number = 60
): CodonGroup[][] {
  const rows: CodonGroup[][] = [];
  let currentRow: CodonGroup[] = [];
  let currentRowLength = 0;
  
  for (const group of groups) {
    const groupLength = group.bases.length;
    
    // Check if adding this group would exceed row length
    if (currentRowLength + groupLength > basesPerRow && currentRow.length > 0) {
      rows.push(currentRow);
      currentRow = [];
      currentRowLength = 0;
    }
    
    currentRow.push(group);
    currentRowLength += groupLength;
  }
  
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }
  
  return rows;
}

/**
 * Get the starting position for a row of codon groups
 */
export function getRowStartPositionFromGroups(
  groups: CodonGroup[]
): number {
  if (groups.length === 0) return 1;
  return groups[0].position;
}

