import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateViewSlug, generateEditToken } from '@/lib/slugs';
import { CreateSequenceRequest, CreateSequenceResponse } from '@/types';
import { validateSequence } from '@/lib/sequenceUtils';

export async function POST(request: NextRequest) {
  try {
    const body: CreateSequenceRequest = await request.json();
    const { nucleotides, type, name } = body;

    // Validate input
    if (!nucleotides || typeof nucleotides !== 'string') {
      return NextResponse.json(
        { error: 'nucleotides is required and must be a string' },
        { status: 400 }
      );
    }

    if (!type || (type !== 'DNA' && type !== 'RNA')) {
      return NextResponse.json(
        { error: 'type must be either "DNA" or "RNA"' },
        { status: 400 }
      );
    }

    // Validate sequence using existing utility
    const validation = validateSequence(nucleotides);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid sequence' },
        { status: 400 }
      );
    }

    // Ensure type matches validation
    if (validation.type !== type) {
      return NextResponse.json(
        { error: `Sequence type mismatch. Detected: ${validation.type}, provided: ${type}` },
        { status: 400 }
      );
    }

    // Generate slugs
    const view_slug = generateViewSlug();
    const edit_token = generateEditToken();

    // Insert into database
    const { data, error } = await supabase
      .from('sequences')
      .insert({
        nucleotides: validation.sequence,
        type,
        name: name || null,
        view_slug,
        edit_token,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create sequence' },
        { status: 500 }
      );
    }

    const response: CreateSequenceResponse = {
      view_slug: data.view_slug,
      edit_token: data.edit_token,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating sequence:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

