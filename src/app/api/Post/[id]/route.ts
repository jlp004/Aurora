import prisma from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server';

// No idea if this is actually working properly; you can test your code with Postman

// GET - Get a posts item by user id
// PUT - Update an existing post
// POST - Add a post

// TODO - get post by tag

const findUser = async(user_id: number) => {
  const posts = await prisma.post.findMany({
    where: { userId: Number(user_id) },
  })
}

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const body = await req.json()
    const { user_id } = body

    if(!user_id) {
      return NextResponse.json({ error: "Product ID is missing."}, { status: 400 })
    }

    const posts = await findUser(user_id)

    return NextResponse.json( posts, { status: 200} )
  }
  catch (error) {
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 })
  }
}



export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const body = await req.json()
    const { post_id, title, pictureURL, userId, tags } = body

    if(!post_id) {
      return NextResponse.json({ error: "Post ID is missing."}, { status: 400 })
    }

    const addPost = await prisma.post.create({  //This may not work as expected?
      data: {
        id: Number(post_id),
        title,
        pictureURL,
        userId,
        tags
      },
    })

    return NextResponse.json( addPost, { status: 200} )
  }
  catch (error) {
    return NextResponse.json({ error: 'Failed to post' }, { status: 501 })

  }
}

export async function PUT(req: NextRequest, res: NextResponse) {
  try {
    const body = await req.json()
    const { product_id, title, tags } = body   //can only update title and tags

    if(!product_id) {
      return NextResponse.json({ error: "Product ID is missing."}, { status: 400 })
    }

    const updatedPost = await prisma.post.update({
      where: { id: Number(product_id) }, 
      data: {
        title,
        tags
      },
    })

    if (!updatedPost) {
        return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }

    return NextResponse.json(updatedPost, { status: 200 })
  }
  catch (error) {
    console.error("Error updating post: ", error)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}