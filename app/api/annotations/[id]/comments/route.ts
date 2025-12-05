import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { dbCommentToComment } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch all comments for this annotation
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('annotation_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    // Convert to client format
    const comments = (data || []).map(dbCommentToComment);

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

