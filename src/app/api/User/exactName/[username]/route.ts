import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(
  req: Request,
  context: { params: { username: string } }
) {
  try {
    const username = context.params.username.toLowerCase()
    console.log('Searching for username:', username)

    const user = await prisma.user.findUnique({
      where: {
        username: username
      },
      select: {
        id: true,
        username: true,
        email: true,
        pictureURL: true,
        profileDesc: true
      }
    })

    if (!user) {
      return NextResponse.json({ users: [] }, { status: 200 })
    }

    return NextResponse.json({ users: [user] }, { status: 200 })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}
