'use client';

import { ReadingFrame } from '@/lib/translation';

interface TranslationControlsProps {
  showTranslation: boolean;
  readingFrame: ReadingFrame;
  onToggleTranslation: () => void;
  onFrameChange: (frame: ReadingFrame) => void;
}

/**
 * Controls for translation: toggle and reading frame selector
 */
export default function TranslationControls({
  showTranslation,
  readingFrame,
  onToggleTranslation,
  onFrameChange,
}: TranslationControlsProps) {
  return (
    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-700">
      {/* Toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showTranslation}
          onChange={onToggleTranslation}
          className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
        />
        <span className="text-sm text-gray-300">Show Translation</span>
      </label>

      {/* Frame selector */}
      {showTranslation && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Reading Frame:</span>
          <select
            value={readingFrame}
            onChange={(e) => onFrameChange(Number(e.target.value) as ReadingFrame)}
            className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={0}>Frame 0</option>
            <option value={1}>Frame 1</option>
            <option value={2}>Frame 2</option>
          </select>
        </div>
      )}
    </div>
  );
}

