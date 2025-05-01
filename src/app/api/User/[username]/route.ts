import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  req: Request,
  context: { params: { username: string } }
) {
  const username = context.params.username

  const user = await prisma.user.findMany({
    where: { username },
    include: { posts: true, comments: true }
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
