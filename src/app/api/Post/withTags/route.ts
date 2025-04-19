import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Add this above your POST handler
export async function GET() {
    return NextResponse.json(
      { message: "Endpoint exists! Use POST to create posts with tags" },
      { status: 200 }
    );
  }
  /* 
  {
  "title": "Test Post from Postman",
  "pictureURL": "https://example.com/test.jpg",
  "userId": 1,  // Must match an existing user ID in your DB
  "tags": ["tech", "test"]
}
  */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, pictureURL, userId, tags } = body;

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json({ error: 'Tags are required' }, { status: 400 });
    }

    const tagRecords = await Promise.all(
      tags.map((tagName: string) =>
        prisma.tag.upsert({
          where: { tagName },
          update: {},
          create: { tagName },
        })
      )
    );

    const addPost = await prisma.post.create({
      data: {
        title,
        pictureURL,
        user: { connect: { id: userId } },
        tags: {
          connect: tagRecords.map((tag) => ({ id: tag.id })),
        },
      },
      include: {
        tags: true,
        user: true,
      },
    });

    return NextResponse.json(addPost, { status: 201 });
  } catch (error) {
    console.error('Post creation with tags failed:', error);
    return NextResponse.json({ error: 'Failed to post with tags' }, { status: 500 });
  }
}
