import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { commentToDbComment } from '@/types';

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

/**
 * Helper function to check if annotation belongs to sequence
 */
async function validateAnnotationAccess(
  annotationId: string,
  sequenceId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('annotations')
    .select('sequence_id')
    .eq('id', annotationId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.sequence_id === sequenceId;
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
    const { annotation_id, author, text } = body;

    // Validate required fields
    if (!annotation_id || typeof annotation_id !== 'string') {
      return NextResponse.json(
        { error: 'annotation_id is required and must be a string' },
        { status: 400 }
      );
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'text is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate annotation belongs to sequence
    const hasAccess = await validateAnnotationAccess(annotation_id, sequenceId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Annotation not found or access denied' },
        { status: 404 }
      );
    }

    // Convert to DB format
    const dbComment = commentToDbComment({
      annotation_id,
      author: (author && typeof author === 'string' && author.trim()) ? author.trim() : 'Anonymous',
      text: text.trim(),
    });

    // Insert comment
    const { data, error } = await supabase
      .from('comments')
      .insert(dbComment)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

