import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { annotationToDbAnnotation } from '@/types';

/**
 * Helper function to validate edit_token and get sequence_id
 */
async function validateEditToken(editToken: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('sequences')
    .select('id')
    .eq('edit_token', editToken)
    .single();

  if (error || !data) {
    return null;
  }

  return data.id;
}

export async function POST(request: NextRequest) {
  try {
    // Get edit_token from header
    const editToken = request.headers.get('x-edit-token');
    if (!editToken) {
      return NextResponse.json(
        { error: 'Missing edit_token in header' },
        { status: 401 }
      );
    }

    // Validate token and get sequence_id
    const sequenceId = await validateEditToken(editToken);
    if (!sequenceId) {
      return NextResponse.json(
        { error: 'Invalid edit_token' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { start, end, label, color, type } = body;
    // sequence_id is obtained from edit_token validation, not from body

    // Validate required fields
    if (typeof start !== 'number' || typeof end !== 'number') {
      return NextResponse.json(
        { error: 'start and end must be numbers' },
        { status: 400 }
      );
    }

    if (!label || typeof label !== 'string' || label.trim().length === 0) {
      return NextResponse.json(
        { error: 'label is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!color || typeof color !== 'string') {
      return NextResponse.json(
        { error: 'color is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate positions (1-indexed, start <= end)
    if (start < 1 || end < 1 || start > end) {
      return NextResponse.json(
        { error: 'Invalid position range. start and end must be >= 1, and start <= end' },
        { status: 400 }
      );
    }

    // Convert to DB format
    const dbAnnotation = annotationToDbAnnotation(
      {
        start,
        end,
        label: label.trim(),
        color,
        type: type || undefined,
      },
      sequenceId
    );

    // Insert annotation
    const { data, error } = await supabase
      .from('annotations')
      .insert(dbAnnotation)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create annotation' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating annotation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

