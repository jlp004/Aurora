// written by Megan Chacko - msc220005

// for getting all of the comments of just one post

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {
  const comments = await prisma.comment.findMany({
    where: {
      postId: Number(params.postId)
    },
    include: {
      poster: true,
      parent: true,
      replies: true
    }
  });

  return new Response(JSON.stringify(comments), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
}
