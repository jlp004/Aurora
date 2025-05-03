import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createComment(text: string, posterId: number, postId: number, parentId?: number) {
  try {
    console.log('Creating comment with data:', { text, posterId, postId, parentId });

    const comment = await prisma.comment.create({
      data: {
        text,
        poster: { connect: { id: posterId } },
        post: { connect: { id: postId }},
        parent: parentId ? { connect: { id: parentId } } : undefined
      },
      include: { poster: true, parent: true }
    });

    console.log('Comment created successfully:', comment);
    return { success: true, comment };
  } catch (error) {
    console.error('Error creating comment:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function getComments() {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        poster: true,
        parent: true,
        replies: true
      }
    });
    return { success: true, comments };
  } catch (error) {
    console.error('Error fetching comments:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
} 