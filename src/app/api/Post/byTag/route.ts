import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  const tag = req.nextUrl.searchParams.get('tag')
  
  if (!tag) {
    return NextResponse.json(
      { error: 'Missing tag parameter' },
      { status: 400 }
    )
  }

  try {
    const posts = await prisma.post.findMany({
      where: {
        postTags: {
          some: {
            tag: {
              name: tag
            }
          }
        }
      },
      include: {
        user: true,
        postTags: {
          include: {
            tag: true
          }
        }
      }
    })

    return NextResponse.json(posts.map(post => ({
      ...post,
      tags: post.postTags.map(pt => pt.tag.name)
    })))
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}