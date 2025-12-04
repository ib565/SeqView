import SequenceRow from './SequenceRow';
import { SequenceType } from '@/types';
import { splitIntoRows, getRowStartPosition } from '@/lib/sequenceUtils';

interface SequenceViewerProps {
  sequence: string;
  type: SequenceType;
}

const BASES_PER_ROW = 60;

/**
 * Main component that displays a sequence in formatted rows
 */
export default function SequenceViewer({ sequence, type }: SequenceViewerProps) {
  const rows = splitIntoRows(sequence, BASES_PER_ROW);

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

      {/* Sequence rows */}
      <div className="space-y-1">
        {rows.map((row, index) => (
          <SequenceRow
            key={index}
            sequence={row}
            startPosition={getRowStartPosition(index, BASES_PER_ROW)}
            type={type}
          />
        ))}
      </div>
    </div>
  );
}

