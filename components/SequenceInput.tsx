'use client';

import { useState } from 'react';
import { validateSequence, validateFasta, FastaValidationResult } from '@/lib/sequenceUtils';
import { ValidationResult } from '@/types';

interface SequenceInputProps {
  onSequenceSubmit: (sequence: string, type: 'DNA' | 'RNA', name?: string) => void;
  disabled?: boolean;
}

/**
 * Input form for pasting/entering a sequence or uploading a FASTA file
 */
export default function SequenceInput({ onSequenceSubmit, disabled = false }: SequenceInputProps) {
  const [input, setInput] = useState('');
  const [name, setName] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const [useFile, setUseFile] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileValidation, setFileValidation] = useState<FastaValidationResult | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setUseFile(false);
      setFileName(null);
      setFileValidation(null);
      setFileError(null);
      return;
    }

    setFileName(file.name);
    setFileValidation(null);
    setFileError(null);

    try {
      const text = await file.text();
      const result = validateFasta(text);
      setFileValidation(result);
      setValidation(null);

      if (result.valid && result.sequence && result.type) {
        setUseFile(true);
        setInput('');
        if (!name.trim() && result.nameFromHeader) {
          setName(result.nameFromHeader);
        }
      } else {
        setUseFile(false);
        setFileError(result.error || 'Invalid FASTA file');
      }
    } catch (err) {
      setUseFile(false);
      setFileValidation(null);
      setFileError(
        err instanceof Error ? err.message : 'Failed to read FASTA file. Please try again.'
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (useFile && fileValidation) {
      setValidation(fileValidation);

      if (fileValidation.valid && fileValidation.sequence && fileValidation.type) {
        onSequenceSubmit(fileValidation.sequence, fileValidation.type, name.trim() || undefined);
        setUseFile(false);
        setFileName(null);
        setFileValidation(null);
        setFileError(null);
        setName('');
      }

      return;
    }

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

      <div className="mb-4 space-y-3">
        <div>
          <label htmlFor="sequence-input" className="block text-sm font-medium text-gray-300 mb-2">
            Paste DNA or RNA sequence
          </label>
          <textarea
            id="sequence-input"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setValidation(null);
              setUseFile(false);
              setFileName(null);
              setFileValidation(null);
              setFileError(null);
            }}
            placeholder="ATGCGATCGATCG... or AUGCGAUCGAUCG..."
            disabled={disabled || useFile}
            className="w-full h-48 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="mt-2 text-xs text-gray-500">
            Accepts A, T, G, C (DNA) or A, U, G, C (RNA). Whitespace is automatically removed.
          </p>
        </div>

        <div>
          <label htmlFor="fasta-input" className="block text-sm font-medium text-gray-300 mb-2">
            Or upload FASTA file
          </label>
          <input
            id="fasta-input"
            type="file"
            accept=".fa,.fasta,.txt"
            onChange={handleFileChange}
            disabled={disabled}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {fileName && (
            <p className="mt-1 text-xs text-gray-400">Selected file: {fileName}</p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            FASTA format: first record only is used. Header line (e.g. &quot;&gt;My sequence&quot;)
            is optional and, if present, will be used as the default name.
          </p>
        </div>
      </div>

      {(validation && !validation.valid) || fileError ? (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
          <p className="text-sm text-red-300">
            {fileError || validation?.error}
          </p>
        </div>
      ) : null}

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

