import Base from './Base';
import { SequenceType } from '@/types';

interface CodonGroupProps {
  bases: string; // 1-3 bases
  aminoAcid: string | null;
  position: number;
  isOrphan: boolean;
  type: SequenceType;
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
}: CodonGroupProps) {
  const isStop = aminoAcid === '*';
  const isIncomplete = aminoAcid === null;
  
  return (
    <span className="inline-flex flex-col items-center gap-0.5">
      {/* Bases */}
      <span className={`flex gap-0.5 ${isOrphan ? 'opacity-50' : ''}`}>
        {bases.split('').map((base, index) => (
          <Base key={index} base={base} type={type} />
        ))}
        {/* Pad incomplete codons with spaces for alignment */}
        {bases.length < 3 && !isOrphan && (
          <span className="text-gray-600 w-4"> </span>
        )}
      </span>
      
      {/* Amino acid */}
      {!isOrphan && (
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

