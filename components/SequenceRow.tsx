'use client';

import { forwardRef } from 'react';
import CodonGroup from './CodonGroup';
import { SequenceType, Selection } from '@/types';
import { CodonGroup as CodonGroupType } from '@/lib/translation';

interface SequenceRowProps {
  codonGroups: CodonGroupType[];
  startPosition: number;
  type: SequenceType;
  showTranslation: boolean;
  selection: Selection;
  onBaseClick: (position: number) => void;
}

/**
 * Single row displaying position number and codon groups
 * When translation is enabled, amino acids are shown below codons
 * Supports forwardRef for scroll-to-position functionality
 */
const SequenceRow = forwardRef<HTMLDivElement, SequenceRowProps>(
  function SequenceRow(
    {
      codonGroups,
      startPosition,
      type,
      showTranslation,
      selection,
      onBaseClick,
    },
    ref
  ) {
    return (
      <div ref={ref} className="flex items-start gap-4 font-mono text-sm">
        {/* Position number - right-aligned, gray */}
        <div className="text-gray-500 w-16 text-right shrink-0 select-none">
          {startPosition}
        </div>
        
        {/* Codon groups with spacing */}
        <div className="flex gap-1 flex-wrap items-start">
          {codonGroups.map((group, index) => (
            <CodonGroup
              key={`${group.position}-${index}`}
              bases={group.bases}
              aminoAcid={group.aminoAcid}
              position={group.position}
              isOrphan={group.isOrphan}
              type={type}
              showTranslation={showTranslation}
              selection={selection}
              onBaseClick={onBaseClick}
            />
          ))}
        </div>
      </div>
    );
  }
);

export default SequenceRow;
