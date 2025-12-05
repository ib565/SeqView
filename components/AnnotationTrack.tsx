'use client';

import { Annotation } from '@/types';

interface AnnotationTrackProps {
  annotations: Annotation[];
  rowStart: number; // 1-indexed start position of this row
  rowEnd: number;   // 1-indexed end position of this row
  basesPerRow: number;
  onAnnotationClick?: (annotation: Annotation) => void;
}

/**
 * Displays annotation bars below a sequence row (Benchling-style)
 * Each annotation that overlaps with this row's range is shown as a colored bar
 */
export default function AnnotationTrack({
  annotations,
  rowStart,
  rowEnd,
  basesPerRow,
  onAnnotationClick,
}: AnnotationTrackProps) {
  // Filter annotations that overlap with this row
  const overlappingAnnotations = annotations.filter(
    (a) => a.start <= rowEnd && a.end >= rowStart
  );

  if (overlappingAnnotations.length === 0) {
    return null;
  }

  // Calculate the pixel width per base (approximate)
  // Each base is roughly 10px wide with gaps
  const baseWidth = 10.5; // Adjusted for codon grouping gaps

  return (
    <div className="ml-20 mt-1 space-y-1">
      {overlappingAnnotations.map((annotation) => {
        // Calculate the visible portion of this annotation within the row
        const visibleStart = Math.max(annotation.start, rowStart);
        const visibleEnd = Math.min(annotation.end, rowEnd);
        
        // Calculate offset from row start (0-indexed within row)
        const offsetFromRowStart = visibleStart - rowStart;
        const visibleLength = visibleEnd - visibleStart + 1;
        
        // Calculate pixel positions
        // Account for codon spacing: every 3 bases has a gap (4px)
        const codonGaps = Math.floor(offsetFromRowStart / 3) * 4;
        const leftOffset = offsetFromRowStart * baseWidth + codonGaps;
        
        const endCodonGaps = Math.floor((offsetFromRowStart + visibleLength) / 3) * 4;
        const barWidth = visibleLength * baseWidth + (endCodonGaps - codonGaps);

        // Determine if annotation continues beyond this row
        const continuesLeft = annotation.start < rowStart;
        const continuesRight = annotation.end > rowEnd;

        return (
          <div
            key={annotation.id}
            className="relative h-5 cursor-pointer group"
            style={{ marginLeft: `${leftOffset}px` }}
            onClick={() => onAnnotationClick?.(annotation)}
          >
            <div
              className={`h-full flex items-center px-1.5 text-xs font-medium text-white truncate transition-all hover:brightness-110 ${
                continuesLeft ? 'rounded-l-none' : 'rounded-l'
              } ${continuesRight ? 'rounded-r-none' : 'rounded-r'}`}
              style={{
                backgroundColor: annotation.color,
                width: `${barWidth}px`,
                minWidth: '20px',
              }}
              title={`${annotation.label} (${annotation.start}-${annotation.end})`}
            >
              {/* Only show label if bar is wide enough */}
              {barWidth > 40 && (
                <span className="truncate drop-shadow-sm">
                  {annotation.label}
                </span>
              )}
            </div>
            
            {/* Show full label on hover for narrow bars */}
            {barWidth <= 40 && (
              <div className="absolute left-0 -top-6 bg-gray-900 border border-gray-700 px-2 py-0.5 rounded text-xs text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                {annotation.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

