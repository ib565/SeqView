'use client';

import { SequenceType } from '@/types';

interface BaseProps {
  base: string;
  type: SequenceType;
  position: number;
  isSelected?: boolean;
  annotationColor?: string | null;
  onClick?: (position: number) => void;
}

/**
 * Single nucleotide base with color coding
 * A = green, T/U = red, G = gold/yellow, C = blue
 * Supports selection highlighting and annotation colors
 */
export default function Base({
  base,
  type,
  position,
  isSelected = false,
  annotationColor = null,
  onClick,
}: BaseProps) {
  const getColorClass = (base: string): string => {
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

  const handleClick = () => {
    if (onClick) {
      onClick(position);
    }
  };

  // Build class string based on state
  const baseClasses = [
    'font-mono',
    'cursor-pointer',
    'select-none',
    'rounded-sm',
    'transition-all',
    'duration-75',
    getColorClass(base),
  ];

  // Selection takes precedence over annotation for visibility
  if (isSelected) {
    baseClasses.push('bg-blue-500/40', 'ring-1', 'ring-blue-400');
  } else if (annotationColor) {
    // Use annotation color as background with transparency
    // We'll apply this via inline style
  }

  return (
    <span
      className={baseClasses.join(' ')}
      style={
        !isSelected && annotationColor
          ? { backgroundColor: `${annotationColor}40` } // 40 = 25% opacity in hex
          : undefined
      }
      onClick={handleClick}
      title={`Position ${position}`}
    >
      {base}
    </span>
  );
}
