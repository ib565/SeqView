import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SequenceWithAnnotations } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Fetch sequence by edit_token
    const { data: sequence, error: seqError } = await supabase
      .from('sequences')
      .select('*')
      .eq('edit_token', token)
      .single();

    if (seqError || !sequence) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      );
    }

    // Fetch annotations for this sequence
    const { data: annotations, error: annError } = await supabase
      .from('annotations')
      .select('*')
      .eq('sequence_id', sequence.id)
      .order('start_pos', { ascending: true });

    if (annError) {
      console.error('Error fetching annotations:', annError);
      return NextResponse.json(
        { error: 'Failed to fetch annotations' },
        { status: 500 }
      );
    }

    const response: SequenceWithAnnotations = {
      sequence,
      annotations: annotations || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching sequence:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

