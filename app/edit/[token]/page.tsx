'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import SequenceViewer from '@/components/SequenceViewer';
import ShareLinks from '@/components/ShareLinks';
import { dbAnnotationToAnnotation, SequenceType, Annotation, DbSequence, DbAnnotation } from '@/types';

interface SequenceWithAnnotations {
  sequence: DbSequence;
  annotations: DbAnnotation[];
}

export default function EditPage() {
  const params = useParams();
  const token = params?.token as string;
  const [data, setData] = useState<SequenceWithAnnotations | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSequence() {
      try {
        const response = await fetch(`/api/sequences/edit/${token}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Sequence not found');
          } else {
            setError('Failed to load sequence');
          }
          setLoading(false);
          return;
        }

        const fetchedData = await response.json();
        setData(fetchedData);
        const clientAnnotations = fetchedData.annotations.map(dbAnnotationToAnnotation);
        setAnnotations(clientAnnotations);
      } catch (err) {
        setError('Failed to load sequence');
        console.error('Error fetching sequence:', err);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchSequence();
    }
  }, [token]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0d1117] text-gray-100">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-12">
            <p className="text-gray-400">Loading sequence...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#0d1117] text-gray-100">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-12">
            <p className="text-red-400">{error || 'Sequence not found'}</p>
          </div>
        </div>
      </main>
    );
  }

  const { sequence } = data;

  return (
    <main className="min-h-screen bg-[#0d1117] text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">SeqView</h1>
              <p className="text-gray-400">Editing sequence</p>
              {sequence.name && (
                <p className="text-gray-300 mt-2">{sequence.name}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <ShareLinks
                viewSlug={sequence.view_slug}
                editToken={token}
                showEditLink={true}
              />
              <Link
                href="/"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 flex items-center gap-2"
              >
                <span>←</span>
                <span>Back to Homepage</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Sequence viewer (editable) */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <SequenceViewer
            sequence={sequence.nucleotides}
            type={sequence.type as SequenceType}
            annotations={annotations}
            onAnnotationsChange={setAnnotations}
            readOnly={false}
            editToken={token}
          />
        </div>
      </div>
    </main>
  );
}

