import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  req: Request,
  context: { params: { username: string } }
) {
  const username = context.params.username.toLowerCase()
  console.log('Searching for username:', username)

  const users = await prisma.user.findMany({
    where: {
      username: {
        contains: username
      }
    },
    select: {
      id: true,
      username: true,
      email: true,
      pictureURL: true,
      profileDesc: true
    }
  })

  console.log('Found users:', users)

  // Filter results case-insensitively since Prisma's contains is case-sensitive
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(username)
  )

  console.log('Filtered users:', filteredUsers)

  return new Response(JSON.stringify({ users: filteredUsers }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  })
}
