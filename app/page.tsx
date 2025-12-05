'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SequenceInput from '@/components/SequenceInput';
import RecentSequences from '@/components/RecentSequences';
import { SequenceType, CreateSequenceRequest } from '@/types';
import { saveRecentSequence } from '@/lib/recentSequences';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSequenceSubmit = async (seq: string, type: SequenceType, name?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const requestBody: CreateSequenceRequest = {
        nucleotides: seq,
        type,
        name,
      };

      const response = await fetch('/api/sequences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create sequence');
      }

      const data = await response.json();
      
      // Save to recent sequences
      saveRecentSequence({
        view_slug: data.view_slug,
        edit_token: data.edit_token,
        name: name || null,
        length: seq.length,
        created_at: new Date().toISOString(),
      });
      
      // Redirect to edit page with the edit token
      router.push(`/edit/${data.edit_token}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsLoading(false);
    }
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
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            {error && (
              <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
            <SequenceInput
              onSequenceSubmit={handleSequenceSubmit}
              disabled={isLoading}
            />
            {isLoading && (
              <div className="mt-4 text-center text-gray-400">
                <p>Creating sequence...</p>
              </div>
            )}
            <RecentSequences />
          </div>
        </div>
      </div>
    </main>
  );
}
