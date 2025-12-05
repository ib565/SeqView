import CodonGroup from './CodonGroup';
import { SequenceType } from '@/types';
import { CodonGroup as CodonGroupType } from '@/lib/translation';

interface SequenceRowProps {
  codonGroups: CodonGroupType[];
  startPosition: number;
  type: SequenceType;
  showTranslation: boolean;
}

/**
 * Single row displaying position number and codon groups
 * When translation is enabled, amino acids are shown below codons
 */
export default function SequenceRow({
  codonGroups,
  startPosition,
  type,
  showTranslation,
}: SequenceRowProps) {
  return (
    <div className="flex items-start gap-4 font-mono text-sm">
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
            aminoAcid={showTranslation ? group.aminoAcid : null}
            position={group.position}
            isOrphan={group.isOrphan}
            type={type}
          />
        ))}
      </div>
    </div>
  );
}
