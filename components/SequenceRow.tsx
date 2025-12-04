import Base from './Base';
import { SequenceType } from '@/types';

interface SequenceRowProps {
  sequence: string;
  startPosition: number;
  type: SequenceType;
}

/**
 * Single row displaying position number and sequence bases
 */
export default function SequenceRow({ sequence, startPosition, type }: SequenceRowProps) {
  return (
    <div className="flex items-start gap-4 font-mono text-sm">
      {/* Position number - right-aligned, gray */}
      <div className="text-gray-500 w-16 text-right shrink-0 select-none">
        {startPosition}
      </div>
      
      {/* Sequence bases */}
      <div className="flex gap-0.5 flex-wrap">
        {sequence.split('').map((base, index) => (
          <Base key={index} base={base} type={type} />
        ))}
      </div>
    </div>
  );
}

