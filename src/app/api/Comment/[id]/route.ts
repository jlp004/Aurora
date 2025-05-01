import { PrismaClient } from '@prisma/client'
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
