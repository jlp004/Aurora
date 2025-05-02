import prisma from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server';

// GET - Get all posts or filter by userId
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isSearch = searchParams.get("search");
    const userId = searchParams.get("userId");
    
    // If search parameter is present, use the search function
    if (isSearch === "true") {
      return search(req);
    }
    
    // If userId is provided, filter posts by userId
    if (userId) {
      const posts = await prisma.post.findMany({
        where: {
          userId: Number(userId)
        },
        include: {
          user: true
        },
        orderBy: {
          id: 'desc'
        }
      });
      return NextResponse.json({ data: posts }, { status: 200 });
    }
    
    // Otherwise return all posts
    const posts = await prisma.post.findMany({
      include: {
        user: true
      },
      orderBy: {
        id: 'desc'
      }
    });
    return NextResponse.json({ data: posts }, { status: 200 });
  }
  catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to retrieve posts" }, { status: 500 });
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

    const posts = await prisma.post.findMany({
      where: {
        title: {
          contains: query,  
        }
      },
      include: {
        user: true  // Include user data for each post
      }
    });

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error('Search failed:', error);
    return NextResponse.json({ message: error instanceof Error ? error.message : "Failed to search posts" }, { status: 500 });
  }
}
/////////////////////////

// POST - add a new post
// STILL NEEDS TAGS!! 
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, pictureURL, userId } = body

    if (!title || !pictureURL || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const addPost = await prisma.post.create({
      data: {
        title,
        pictureURL,
        userId: Number(userId), // ensures userId is a number
      },
    })

    return NextResponse.json( addPost, { status: 201} )
  }
  catch (error) {
    console.error('Post creation failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to post' }, { status: 500 })
  }
}