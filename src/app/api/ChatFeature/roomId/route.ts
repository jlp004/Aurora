import { NextResponse } from 'next/server'
import prisma from '@/lib/db';// Make sure this is your Prisma client import
import type { Message } from '@prisma/client'

export async function GET(
  req: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const messages: Message[] = await prisma.message.findMany({
      where: { chatRoomId: parseInt(params.roomId) },
      orderBy: { createdAt: 'asc' },
      include: { sender: true }
    })
    return NextResponse.json(messages)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const { content, senderId }: { content: string; senderId: number } = await req.json()
    
    const room = await prisma.chatRoom.findUnique({
      where: { id: parseInt(params.roomId) },
      select: { user1Id: true, user2Id: true }
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Chat room not found' },
        { status: 404 }
      )
    }

    const newMessage: Message = await prisma.message.create({
      data: {
        content,
        senderId,
        chatRoomId: parseInt(params.roomId),
        receiverId: room.user1Id === senderId ? room.user2Id : room.user1Id
      }
    })

    return NextResponse.json(newMessage)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}