'use client';

import { useMemo } from 'react';
import { Annotation } from '@/types';

interface AnnotationTrackProps {
  annotations: Annotation[];
  rowStart: number; // 1-indexed start position of this row
  rowEnd: number;   // 1-indexed end position of this row
  basesPerRow: number;
  onAnnotationClick?: (annotation: Annotation) => void;
}

interface Lane {
  annotations: Annotation[];
  lastEnd: number; // Rightmost end position in this lane
}

/**
 * Assign annotations to lanes using greedy first-fit algorithm
 * Non-overlapping annotations go in the same lane
 */
function assignToLanes(annotations: Annotation[]): Lane[] {
  // Sort by start position
  const sorted = [...annotations].sort((a, b) => a.start - b.start);
  
  const lanes: Lane[] = [];
  
  for (const annotation of sorted) {
    // Try to find the first lane where this annotation fits
    let placed = false;
    for (const lane of lanes) {
      if (annotation.start > lane.lastEnd) {
        // Fits! Add to this lane
        lane.annotations.push(annotation);
        lane.lastEnd = Math.max(lane.lastEnd, annotation.end);
        placed = true;
        break;
      }
    }
    
    // If no lane fits, create a new one
    if (!placed) {
      lanes.push({
        annotations: [annotation],
        lastEnd: annotation.end,
      });
    }
  }
  
  return lanes;
}

/**
 * Calculate pixel offset and width for an annotation bar
 */
function calculateBarPosition(
  annotation: Annotation,
  rowStart: number,
  rowEnd: number,
  baseWidth: number
): { left: number; width: number; visibleStart: number; visibleEnd: number } {
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
  
  return {
    left: leftOffset,
    width: barWidth,
    visibleStart,
    visibleEnd,
  };
}

/**
 * Displays annotation bars below a sequence row (Benchling-style)
 * Uses lane packing to avoid overlapping annotations on the same line
 */
export default function AnnotationTrack({
  annotations,
  rowStart,
  rowEnd,
  basesPerRow,
  onAnnotationClick,
}: AnnotationTrackProps) {
  // Filter annotations that overlap with this row
  const overlappingAnnotations = useMemo(
    () => annotations.filter((a) => a.start <= rowEnd && a.end >= rowStart),
    [annotations, rowStart, rowEnd]
  );

  // Assign overlapping annotations to lanes
  const lanes = useMemo(
    () => assignToLanes(overlappingAnnotations),
    [overlappingAnnotations]
  );

  if (lanes.length === 0) {
    return null;
  }

  // Calculate the pixel width per base (approximate)
  // Each base is roughly 10px wide with gaps
  const baseWidth = 10.5; // Adjusted for codon grouping gaps

  return (
    <div className="ml-20 mt-1 space-y-1">
      {lanes.map((lane, laneIndex) => (
        <div key={laneIndex} className="relative h-5">
          {lane.annotations.map((annotation) => {
            const { left, width, visibleStart, visibleEnd } = calculateBarPosition(
              annotation,
              rowStart,
              rowEnd,
              baseWidth
            );

            // Determine if annotation continues beyond this row
            const continuesLeft = annotation.start < rowStart;
            const continuesRight = annotation.end > rowEnd;

            return (
              <div
                key={annotation.id}
                className="absolute top-0 cursor-pointer group"
                style={{
                  left: `${left}px`,
                }}
                onClick={() => onAnnotationClick?.(annotation)}
              >
                <div
                  className={`h-full flex items-center px-1.5 text-xs font-medium text-white truncate transition-all hover:brightness-110 ${
                    continuesLeft ? 'rounded-l-none' : 'rounded-l'
                  } ${continuesRight ? 'rounded-r-none' : 'rounded-r'}`}
                  style={{
                    backgroundColor: annotation.color,
                    width: `${width}px`,
                    minWidth: '20px',
                  }}
                  title={`${annotation.label} (${annotation.start}-${annotation.end})`}
                >
                  {/* Only show label if bar is wide enough */}
                  {width > 40 && (
                    <span className="truncate drop-shadow-sm">
                      {annotation.label}
                    </span>
                  )}
                </div>
                
                {/* Show full label on hover for narrow bars */}
                {width <= 40 && (
                  <div className="absolute left-0 -top-6 bg-gray-900 border border-gray-700 px-2 py-0.5 rounded text-xs text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    {annotation.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
