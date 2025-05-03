// written by Megan Chacko - msc220005

// to update the likes of a specific post

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json()
  const postId = Number(params.id)
  const { userId } = body

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { likedBy: true }
  })

  if (!post) {
    return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404 })
  }

  const hasLiked = post.likedBy.some(user => user.id === userId)

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      likes: {
        set: hasLiked ? post.likes - 1 : post.likes + 1
      },
      likedBy: {
        [hasLiked ? 'disconnect' : 'connect']: {
          id: userId
        }
      }
    },
    include: { likedBy: true }
  })

  return new Response(JSON.stringify(updatedPost), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  })
}
