import prisma from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

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
export async function POST(req: NextRequest) {
  try {
    console.log('Received POST request');
    const formData = await req.formData();
    console.log('FormData received:', {
      hasFile: formData.has('file'),
      hasTitle: formData.has('title'),
      hasUserId: formData.has('userId'),
      hasTags: formData.has('tags')
    });

    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const userId = formData.get('userId') as string;
    const tags = formData.getAll('tags') as string[];

    console.log('Extracted form data:', {
      file: file ? { name: file.name, type: file.type, size: file.size } : null,
      title,
      userId,
      tags
    });

    if (!file || !title || !userId) {
      console.error('Missing required fields:', { file: !!file, title: !!title, userId: !!userId });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}.${extension}`;
    
    console.log('Processing file:', { filename, extension });
    
    // Convert the file to a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('File converted to buffer:', { bufferSize: buffer.length });

    // Save the file to the public/images directory
    const filePath = path.join(process.cwd(), 'public', 'images', filename);
    console.log('Saving file to:', filePath);
    await writeFile(filePath, buffer);
    console.log('File saved successfully');

    // Create the post with the uploaded image URL
    const pictureURL = `/images/${filename}`;
    console.log('Creating post with data:', {
      title,
      pictureURL,
      userId: Number(userId),
      tags
    });

    const addPost = await prisma.post.create({
      data: {
        title,
        pictureURL,
        userId: Number(userId),
        tags: {
          connect: tags.map(tagName => ({ tagName }))
        }
      },
      include: {
        tags: true
      }
    });

    console.log('Post created successfully:', addPost);
    return NextResponse.json(addPost, { status: 201 });
  } catch (error) {
    console.error('Post creation failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to post' },
      { status: 500 }
    );
  }
}