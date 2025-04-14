// src/app/api/User/[id]/route.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await prisma.user.findUnique({
    where: { id: Number(params.id) }
  })

  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404
    })
  }

  return new Response(JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' }
  })
}
