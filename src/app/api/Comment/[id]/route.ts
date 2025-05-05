import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
const prisma = new PrismaClient()

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const comment = await prisma.comment.findUnique({
    where: { id: Number(params.id) },
    include: {
      poster: true,
      parent: true,
      replies: true
    }
  })

  if (!comment) {
    return new Response(JSON.stringify({ error: 'Comment not found' }), { status: 404 })
  }

  return new Response(JSON.stringify(comment), {
    headers: { 'Content-Type': 'application/json' }
  })
}

// Delete a comment
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
 ) {
  try {
    const commentId = params.id;
 
 
    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }
 
    await prisma.comment.delete({
      where: { id: parseInt(commentId, 10) },
    });
 
    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
 
  // try {
  //   const { searchParams } = new URL(req.url);
  //   const commentId = searchParams.get('id');
 
  //   if (!commentId) {
  //     return NextResponse.json(
  //       { error: 'Comment ID is required' },
  //       { status: 400 }
  //     );
  //   }
 
  //   await prisma.comment.delete({
  //     where: { id: parseInt(commentId, 10) },
  //   });
 
  //   return NextResponse.json({ message: 'Comment deleted successfully' });
  // } catch (error) {
  //   console.error('Error deleting comment:', error);
  //   return NextResponse.json(
  //     { error: 'Failed to delete comment' },
  //     { status: 500 }
  //   );
  // }
  }
 