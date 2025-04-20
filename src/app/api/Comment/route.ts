import prisma from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        poster: true,
        parent: true,
        replies: true
      }
    })
    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { text, posterId, postId, parentId } = body

    if (!text || !posterId || !postId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        poster: { connect: { id: posterId } },
        post: { connect: { id: postId }},
        parent: parentId ? { connect: { id: parentId } } : undefined
      },
      include: { 
        poster: true, 
        parent: true,
        post: true
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
