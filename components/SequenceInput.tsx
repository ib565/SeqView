'use client';

import { useState } from 'react';
import { validateSequence } from '@/lib/sequenceUtils';
import { ValidationResult } from '@/types';

interface SequenceInputProps {
  onSequenceSubmit: (sequence: string, type: 'DNA' | 'RNA', name?: string) => void;
  disabled?: boolean;
}

/**
 * Input form for pasting/entering a sequence
 */
export default function SequenceInput({ onSequenceSubmit, disabled = false }: SequenceInputProps) {
  const [input, setInput] = useState('');
  const [name, setName] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = validateSequence(input);
    setValidation(result);

    if (result.valid && result.sequence && result.type) {
      onSequenceSubmit(result.sequence, result.type, name.trim() || undefined);
      setInput('');
      setName('');
      setValidation(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl">
      <div className="mb-4">
        <label htmlFor="sequence-name" className="block text-sm font-medium text-gray-300 mb-2">
          Sequence Name (optional)
        </label>
        <input
          id="sequence-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          placeholder="e.g., My Gene X, Promoter Region"
          disabled={disabled}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        />
      </div>

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
          disabled={disabled}
          className="w-full h-48 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
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
        disabled={disabled}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        View Sequence
      </button>
    </form>
  );
}

