import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get('tag');

  if (!tag) {
    return NextResponse.json({ error: 'Missing tag parameter' }, { status: 400 });
  }

  try {
    const posts = await prisma.post.findMany({
      where: {
        tags: {
          some: {
            tagName: tag,
          },
        },
      },
      include: {
        user: true,
        tags: true,
        Comment: true,
      },
    });

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error('Error fetching posts by tag:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
