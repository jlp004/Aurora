import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const post = await prisma.post.findUnique({
    where: { id: Number(params.id) },
    include: { user: true, tags: true }
  })

  if (!post) {
    return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404 })
  }

  return new Response(JSON.stringify(post), {
    headers: { 'Content-Type': 'application/json' }
  })
}
