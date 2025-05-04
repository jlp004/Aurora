import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Mock enum validation (since Prisma enums can't be imported directly)
const ALLOWED_TAGS = [
  'TECHNOLOGY',
  'SCIENCE',
  'ART',
  'BUSINESS',
  'HEALTH',
  'SPORTS',
  'FOOD',
  'TRAVEL'
]

export async function POST(req: Request) {
  try {
    const { title, pictureURL, userId, tags } = await req.json()

    // Validate against allowed tags
    const invalidTags = tags.filter((t: string) => !ALLOWED_TAGS.includes(t))
    if (invalidTags.length > 0) {
      return NextResponse.json(
        { error: `Invalid tags: ${invalidTags.join(', ')}` },
        { status: 400 }
      )
    }

    // Rest of your existing implementation...
    const post = await prisma.post.create({
      data: {
        title,
        pictureURL: pictureURL || '',
        userId,
        postTags: {
          create: tags.map((tag: string) => ({
            tag: {
              connectOrCreate: {
                where: { name: tag },
                create: { name: tag }
              }
            }
          }))
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
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
