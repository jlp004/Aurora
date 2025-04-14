// src/app/api/User/[username]/route.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  const user = await prisma.user.findUnique({
    where: {
      username: params.username
    },
    include: {
      posts: true,
      comments: true
    }
  })

  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404
    })
  }

  return new Response(JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  })
}
