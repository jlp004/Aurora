import prisma from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server';

// GET - Get all posts (not recommended if database ever gets large)

export async function GET(req: NextRequest) {
  try {
    const posts = await prisma.post.findMany()
    return NextResponse.json({ message: "Posts fetched: ", data: posts }, { status: 200 } )
  }
  catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Failed to retrieve posts" }, { status: 500})
  }
}

// POST - add a new post

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const body = await req.json()
    const { title, pictureURL, userId, tags } = body

    const addPost = await prisma.post.create({  //This may not work as expected?
      data: {
        title,
        pictureURL,
        userId,
        tags: {
          connect: []                           // TODO: this allows null tags but tags should be a requirement; should be implemented when tags are finished
        },
      },
    })

    return NextResponse.json( addPost, { status: 200} )
  }
  catch (error) {
    console.error('Post creation failed:', error);
    return NextResponse.json({ error: 'Failed to post' }, { status: 501 })

  }
}