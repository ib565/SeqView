'use client';

import { useState } from 'react';
import SequenceRow from './SequenceRow';
import TranslationControls from './TranslationControls';
import { SequenceType } from '@/types';
import {
  splitIntoCodonGroups,
  splitCodonGroupsIntoRows,
  getRowStartPositionFromGroups,
  ReadingFrame,
} from '@/lib/translation';

interface SequenceViewerProps {
  sequence: string;
  type: SequenceType;
}

const BASES_PER_ROW = 60;

/**
 * Main component that displays a sequence in formatted rows
 * Supports translation with reading frame selection
 */
export default function SequenceViewer({ sequence, type }: SequenceViewerProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [readingFrame, setReadingFrame] = useState<ReadingFrame>(0);

  // Split sequence into codon groups based on reading frame
  const codonGroups = splitIntoCodonGroups(sequence, readingFrame);
  
  // Split codon groups into display rows (~60 bases per row)
  const rows = splitCodonGroupsIntoRows(codonGroups, BASES_PER_ROW);

  return (
    <div className="w-full">
      {/* Header showing sequence info */}
      <div className="mb-4 pb-4 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">Type:</span>
          <span className="px-3 py-1 bg-gray-800 rounded text-sm font-medium">
            {type}
          </span>
          <span className="text-sm text-gray-400">
            Length: {sequence.length.toLocaleString()} bases
          </span>
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
            codonGroups={rowGroups}
            startPosition={getRowStartPositionFromGroups(rowGroups)}
            type={type}
            showTranslation={showTranslation}
          />
        ))}
      </div>
    </div>
  );
}
