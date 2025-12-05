'use client';

import { useMemo } from 'react';
import { Annotation } from '@/types';

interface AnnotationTrackProps {
  annotations: Annotation[];
  rowStart: number;
  rowEnd: number;
  onAnnotationClick?: (annotation: Annotation) => void;
}

interface Lane {
  annotations: Annotation[];
  lastEnd: number;
}

/**
 * Assign annotations to lanes using greedy first-fit algorithm
 */
function assignToLanes(annotations: Annotation[]): Lane[] {
  const sorted = [...annotations].sort((a, b) => a.start - b.start);
  const lanes: Lane[] = [];
  
  for (const annotation of sorted) {
    let placed = false;
    for (const lane of lanes) {
      if (annotation.start > lane.lastEnd) {
        lane.annotations.push(annotation);
        lane.lastEnd = Math.max(lane.lastEnd, annotation.end);
        placed = true;
        break;
      }
    }
    
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
 * Displays annotation bars below a sequence row
 * Uses percentage-based positioning to match parent container width
 */
export default function AnnotationTrack({
  annotations,
  rowStart,
  rowEnd,
  onAnnotationClick,
}: AnnotationTrackProps) {
  const overlappingAnnotations = useMemo(
    () => annotations.filter((a) => a.start <= rowEnd && a.end >= rowStart),
    [annotations, rowStart, rowEnd]
  );

  const lanes = useMemo(
    () => assignToLanes(overlappingAnnotations),
    [overlappingAnnotations]
  );

  if (lanes.length === 0) {
    return null;
  }

  const basesInRow = rowEnd - rowStart + 1;

  return (
    <div className="mt-1 space-y-1 w-full">
      {lanes.map((lane, laneIndex) => (
        <div key={laneIndex} className="relative h-5 w-full">
          {lane.annotations.map((annotation) => {
            // Calculate visible portion
            const visibleStart = Math.max(annotation.start, rowStart);
            const visibleEnd = Math.min(annotation.end, rowEnd);
            
            // Calculate percentage positions
            const leftPercent = ((visibleStart - rowStart) / basesInRow) * 100;
            const widthPercent = ((visibleEnd - visibleStart + 1) / basesInRow) * 100;

            const continuesLeft = annotation.start < rowStart;
            const continuesRight = annotation.end > rowEnd;

            return (
              <div
                key={annotation.id}
                className="absolute top-0 cursor-pointer group h-5"
                style={{ 
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                }}
                onClick={() => onAnnotationClick?.(annotation)}
              >
                <div
                  className={`h-full flex items-center px-1.5 text-xs font-medium text-white truncate transition-all hover:brightness-110 ${
                    continuesLeft ? 'rounded-l-none' : 'rounded-l'
                  } ${continuesRight ? 'rounded-r-none' : 'rounded-r'}`}
                  style={{
                    backgroundColor: annotation.color,
                    minWidth: '20px',
                  }}
                  title={`${annotation.label} (${annotation.start}-${annotation.end})`}
                >
                  <span className="truncate drop-shadow-sm">
                    {annotation.label}
                  </span>
                </div>
                
                {/* Tooltip on hover */}
                <div className="absolute left-0 -top-6 bg-gray-900 border border-gray-700 px-2 py-0.5 rounded text-xs text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  {annotation.label} ({annotation.start}-{annotation.end})
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
