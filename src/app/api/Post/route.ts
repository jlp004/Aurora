import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET() {
  const posts = await prisma.post.findMany({
    include: {
      user: true,
      tags: true
    }
  })
  return new Response(JSON.stringify(posts), {
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { title, pictureURL, userId, tagIds } = body

  const post = await prisma.post.create({
    data: {
      title,
      pictureURL,
      user: { connect: { id: userId } },
      tags: { connect: tagIds.map((id: number) => ({ id })) }
    },
    include: { user: true, tags: true }
  })

  return new Response(JSON.stringify(post), {
    headers: { 'Content-Type': 'application/json' },
    status: 201
  })
}
