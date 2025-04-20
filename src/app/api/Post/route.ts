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

/////////////////////////
// GET - Search posts by title
export async function search(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");  // Getting the search query from the URL

    if (!query) {
      return NextResponse.json({ posts: [] });  // If no query, return empty posts array
    }

    // Search posts where the title contains the query (case insensitive)
    const posts = await prisma.post.findMany({
      where: {
        title: {
          contains: query,   // Exact substring match
          mode: 'insensitive',  // Case insensitive search
        }
      }
    });

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Failed to search posts" }, { status: 500 });
  }
}
/////////////////////////

// POST - add a new post

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, pictureURL, userId, tags } = body

    const addPost = await prisma.post.create({  //This may not work as expected?
      data: {
        title,
        pictureURL,
        user: { connect: {id:userId}},
        tags: {
          connect: []                           // TODO: this allows null tags but tags should be a requirement; should be implemented when tags are finished
        },
      },
    })

    return NextResponse.json( addPost, { status: 201} )
  }
  catch (error) {
    console.error('Post creation failed:', error);
    return NextResponse.json({ error: 'Failed to post' }, { status: 500 })

  }
}