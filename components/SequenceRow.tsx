'use client';

import { forwardRef } from 'react';
import CodonGroup from './CodonGroup';
import AnnotationTrack from './AnnotationTrack';
import { SequenceType, Selection, Annotation } from '@/types';
import { CodonGroup as CodonGroupType } from '@/lib/translation';

interface SequenceRowProps {
  codonGroups: CodonGroupType[];
  startPosition: number;
  endPosition: number;
  type: SequenceType;
  showTranslation: boolean;
  selection: Selection;
  onBaseMouseDown: (position: number) => void;
  onBaseMouseEnter: (position: number) => void;
  annotations: Annotation[];
  onAnnotationClick: (annotation: Annotation) => void;
}

/**
 * Single row displaying position number, codon groups, and annotation track
 * The annotation track is inside the same container as codons for accurate width matching
 */
const SequenceRow = forwardRef<HTMLDivElement, SequenceRowProps>(
  function SequenceRow(
    {
      codonGroups,
      startPosition,
      endPosition,
      type,
      showTranslation,
      selection,
      onBaseMouseDown,
      onBaseMouseEnter,
      annotations,
      onAnnotationClick,
    },
    ref
  ) {
    return (
      <div ref={ref} className="flex items-start gap-4 font-mono text-sm">
        {/* Position number - right-aligned, gray */}
        <div className="text-gray-500 w-16 text-right shrink-0 select-none">
          {startPosition}
        </div>
        
        {/* Codon groups + annotation track in same container */}
        <div className="relative">
          {/* Codon groups */}
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
                onBaseMouseDown={onBaseMouseDown}
                onBaseMouseEnter={onBaseMouseEnter}
              />
            ))}
          </div>
          
          {/* Annotation track - shares container width with codons */}
          <AnnotationTrack
            annotations={annotations}
            rowStart={startPosition}
            rowEnd={endPosition}
            onAnnotationClick={onAnnotationClick}
          />
        </div>
      </div>
    );
  }
);

export default SequenceRow;
