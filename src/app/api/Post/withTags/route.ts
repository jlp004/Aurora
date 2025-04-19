import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { title, pictureURL, userId, tags } = await req.json()

    // Validate tags against enum
    const validTags = Object.values(prisma.TagName)
    const invalidTags = tags.filter((t: string) => !validTags.includes(t))
    if (invalidTags.length > 0) {
      return NextResponse.json(
        { error: `Invalid tags: ${invalidTags.join(', ')}` },
        { status: 400 }
      )
    }

    const post = await prisma.post.create({
      data: {
        title,
        pictureURL,
        userId,
        postTags: {
          create: await Promise.all(
            tags.map(async (tagName: string) => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName },
                  create: { name: tagName }
                }
              }
            }))
          )
        }
      },
      include: {
        postTags: {
          include: {
            tag: true
          }
        }
      }
    })

    return NextResponse.json({
      ...post,
      tags: post.postTags.map(pt => pt.tag.name)
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}