import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

// GET - Get current user data
export async function GET() {
  try {
    // TODO: Replace with actual user ID from auth context
    const userId = 1; // This should come from your auth system
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        posts: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update current user data
export async function PUT(req: Request) {
  try {
    const userId = 1; // This should come from your auth system
    const body = await req.json()
    const { pictureURL, bio } = body

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        pictureURL,
        profileDesc: bio
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 