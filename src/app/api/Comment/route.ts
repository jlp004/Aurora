import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET() {
  const comments = await prisma.comment.findMany({
    include: {
      poster: true,
      parent: true,
      replies: true
    }
  })
  return new Response(JSON.stringify(comments), {
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { text, posterId, postId, parentId } = body

  const comment = await prisma.comment.create({
    data: {
      text,
      poster: { connect: { id: posterId } },
      post: { connect: { id:postId }},
      parent: parentId ? { connect: { id: parentId } } : undefined
    },
    include: { poster: true, parent: true }
  })

  return new Response(JSON.stringify(comment), {
    headers: { 'Content-Type': 'application/json' },
    status: 201
  })
}
