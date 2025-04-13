import prisma from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server';

// GET - Get all posts (not recommended if database ever gets large)

export async function GET(req: NextRequest) {
  try {
    const posts = await prisma.post.findMany()
    return NextResponse.json({ message: "Post fetched: ", data: posts }, { status: 200 } )
  }
  catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Failed to retrieve posts" }, { status: 500})
  }
}