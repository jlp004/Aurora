import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { user1Id, user2Id } = await req.json()

    // Check if chat exists
    const existingRoom = await prisma.chatRoom.findFirst({
      where: {
        OR: [
          { AND: [{ user1Id }, { user2Id }] },
          { AND: [{ user1Id: user2Id }, { user2Id: user1Id }] }
        ]
      }
    })

    if (existingRoom) return NextResponse.json(existingRoom)

    const newRoom = await prisma.chatRoom.create({
      data: { user1Id, user2Id }
    })

    return NextResponse.json(newRoom)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}