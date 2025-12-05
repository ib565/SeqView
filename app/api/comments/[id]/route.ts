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
 * Helper function to check if comment belongs to annotation that belongs to sequence
 */
async function validateCommentAccess(
  commentId: string,
  sequenceId: string
): Promise<boolean> {
  // Get comment's annotation_id
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .select('annotation_id')
    .eq('id', commentId)
    .single();

  if (commentError || !comment) {
    return false;
  }

  // Check if annotation belongs to sequence
  const { data: annotation, error: annError } = await supabase
    .from('annotations')
    .select('sequence_id')
    .eq('id', comment.annotation_id)
    .single();

  if (annError || !annotation) {
    return false;
  }

  return annotation.sequence_id === sequenceId;
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

    // Check if comment belongs to annotation that belongs to sequence
    const hasAccess = await validateCommentAccess(id, sequenceId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Comment not found or access denied' },
        { status: 404 }
      );
    }

    // Delete comment
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

