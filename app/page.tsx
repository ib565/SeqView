'use client';

import { useState } from 'react';
import SequenceInput from '@/components/SequenceInput';
import SequenceViewer from '@/components/SequenceViewer';
import { SequenceType } from '@/types';

export default function Home() {
  const [sequence, setSequence] = useState<string | null>(null);
  const [sequenceType, setSequenceType] = useState<SequenceType | null>(null);

  const handleSequenceSubmit = (seq: string, type: SequenceType) => {
    setSequence(seq);
    setSequenceType(type);
  };

  const handleClear = () => {
    setSequence(null);
    setSequenceType(null);
  };

  return (
    <main className="min-h-screen bg-[#0d1117] text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">SeqView</h1>
          <p className="text-gray-400">View and annotate biological sequences</p>
        </header>

        {/* Main content */}
        {!sequence ? (
          <div className="flex justify-center">
            <SequenceInput onSequenceSubmit={handleSequenceSubmit} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Clear button */}
            <div className="flex justify-between items-center">
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600"
              >
                ← New Sequence
              </button>
            </div>

            {/* Sequence viewer */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <SequenceViewer sequence={sequence} type={sequenceType!} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

