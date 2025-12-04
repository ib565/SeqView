import { SequenceType } from '@/types';

interface BaseProps {
  base: string;
  type: SequenceType;
}

/**
 * Single nucleotide base with color coding
 * A = green, T/U = red, G = gold/yellow, C = blue
 */
export default function Base({ base, type }: BaseProps) {
  const getColorClass = (base: string, type: SequenceType): string => {
    switch (base) {
      case 'A':
        return 'text-green-400';
      case 'T':
      case 'U':
        return 'text-red-400';
      case 'G':
        return 'text-yellow-400';
      case 'C':
        return 'text-blue-400';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <span className={`font-mono ${getColorClass(base, type)}`}>
      {base}
    </span>
  );
}

