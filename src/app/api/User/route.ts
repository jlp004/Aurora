// src/app/api/User/route.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const users = await prisma.user.findMany()
  return new Response(JSON.stringify(users), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { username, email, passwordHash } = body

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash
    }
  })

  return new Response(JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
    status: 201
  })
}
