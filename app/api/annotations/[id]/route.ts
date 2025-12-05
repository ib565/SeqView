import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Check if annotation belongs to this sequence
    const hasAccess = await validateAnnotationAccess(id, sequenceId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Annotation not found or access denied' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const updates: any = {};

    // Validate and add fields if present
    if (body.start !== undefined) {
      if (typeof body.start !== 'number' || body.start < 1) {
        return NextResponse.json(
          { error: 'start must be a number >= 1' },
          { status: 400 }
        );
      }
      updates.start_pos = body.start;
    }

    if (body.end !== undefined) {
      if (typeof body.end !== 'number' || body.end < 1) {
        return NextResponse.json(
          { error: 'end must be a number >= 1' },
          { status: 400 }
        );
      }
      updates.end_pos = body.end;
    }

    if (body.start !== undefined && body.end !== undefined && updates.start_pos > updates.end_pos) {
      return NextResponse.json(
        { error: 'start must be <= end' },
        { status: 400 }
      );
    }

    if (body.label !== undefined) {
      if (typeof body.label !== 'string' || body.label.trim().length === 0) {
        return NextResponse.json(
          { error: 'label must be a non-empty string' },
          { status: 400 }
        );
      }
      updates.label = body.label.trim();
    }

    if (body.color !== undefined) {
      if (typeof body.color !== 'string') {
        return NextResponse.json(
          { error: 'color must be a string' },
          { status: 400 }
        );
      }
      updates.color = body.color;
    }

    if (body.type !== undefined) {
      updates.type = body.type || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update annotation
    const { data, error } = await supabase
      .from('annotations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update annotation' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating annotation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Check if annotation belongs to this sequence
    const hasAccess = await validateAnnotationAccess(id, sequenceId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Annotation not found or access denied' },
        { status: 404 }
      );
    }

    // Delete annotation
    const { error } = await supabase
      .from('annotations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete annotation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting annotation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

