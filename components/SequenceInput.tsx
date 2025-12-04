'use client';

import { useState } from 'react';
import { validateSequence, ValidationResult } from '@/lib/sequenceUtils';

interface SequenceInputProps {
  onSequenceSubmit: (sequence: string, type: 'DNA' | 'RNA') => void;
}

/**
 * Input form for pasting/entering a sequence
 */
export default function SequenceInput({ onSequenceSubmit }: SequenceInputProps) {
  const [input, setInput] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = validateSequence(input);
    setValidation(result);

    if (result.valid && result.sequence && result.type) {
      onSequenceSubmit(result.sequence, result.type);
      setInput('');
      setValidation(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl">
      <div className="mb-4">
        <label htmlFor="sequence-input" className="block text-sm font-medium text-gray-300 mb-2">
          Paste DNA or RNA sequence
        </label>
        <textarea
          id="sequence-input"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setValidation(null);
          }}
          placeholder="ATGCGATCGATCG... or AUGCGAUCGAUCG..."
          className="w-full h-48 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <p className="mt-2 text-xs text-gray-500">
          Accepts A, T, G, C (DNA) or A, U, G, C (RNA). Whitespace is automatically removed.
        </p>
      </div>

      {validation && !validation.valid && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
          <p className="text-sm text-red-300">{validation.error}</p>
        </div>
      )}

      <button
        type="submit"
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        View Sequence
      </button>
    </form>
  );
}

