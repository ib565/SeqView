'use client';

import Base from './Base';
import { SequenceType, Selection } from '@/types';

interface CodonGroupProps {
  bases: string; // 1-3 bases
  aminoAcid: string | null;
  position: number; // 1-indexed start position of this codon
  isOrphan: boolean;
  type: SequenceType;
  selection: Selection;
  onBaseClick: (position: number) => void;
  onBaseMouseDown: (position: number) => void;
  onBaseMouseEnter: (position: number) => void;
  showTranslation: boolean;
}

/**
 * Check if a position is within the current selection
 */
function isPositionSelected(pos: number, selection: Selection): boolean {
  if (selection.start === null) return false;
  if (selection.end === null) return pos === selection.start;
  const min = Math.min(selection.start, selection.end);
  const max = Math.max(selection.start, selection.end);
  return pos >= min && pos <= max;
}

/**
 * Displays a codon group (1-3 bases) with amino acid below
 * Orphan bases (from reading frames 1/2) are shown but not translated
 */
export default function CodonGroup({
  bases,
  aminoAcid,
  position,
  isOrphan,
  type,
  selection,
  onBaseClick,
  onBaseMouseDown,
  onBaseMouseEnter,
  showTranslation,
}: CodonGroupProps) {
  const isStop = aminoAcid === '*';
  const isIncomplete = aminoAcid === null;
  
  return (
    <span className="inline-flex flex-col items-center gap-0.5">
      {/* Bases */}
      <span className={`flex gap-0.5 ${isOrphan ? 'opacity-50' : ''}`}>
        {bases.split('').map((base, index) => {
          const basePosition = position + index;
          return (
            <Base
              key={index}
              base={base}
              type={type}
              position={basePosition}
              isSelected={isPositionSelected(basePosition, selection)}
              onClick={onBaseClick}
              onMouseDown={onBaseMouseDown}
              onMouseEnter={onBaseMouseEnter}
            />
          );
        })}
        {/* Pad incomplete codons with spaces for alignment */}
        {bases.length < 3 && !isOrphan && (
          <span className="text-gray-600 w-4"> </span>
        )}
      </span>
      
      {/* Amino acid - only show when translation is enabled */}
      {showTranslation && !isOrphan && (
        <span
          className={`text-xs font-medium ${
            isStop
              ? 'text-red-400 font-bold'
              : isIncomplete
              ? 'text-gray-600'
              : 'text-purple-400'
          }`}
          title={
            isStop
              ? 'Stop codon'
              : isIncomplete
              ? 'Incomplete codon'
              : `Position ${position}`
          }
        >
          {aminoAcid || '?'}
        </span>
      )}
    </span>
  );
}
