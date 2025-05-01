import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { followerId, followingId } = await req.json();

    if (!followerId || !followingId) {
      return NextResponse.json(
        { error: 'Both followerId and followingId are required' },
        { status: 400 }
      );
    }

    const isFollowing = await prisma.user.findFirst({
      where: {
        id: followerId,
        followingUsers: {
          some: {
            id: followingId
          }
        }
      }
    });

    return NextResponse.json({ isFollowing: !!isFollowing });
  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json(
      { error: 'Failed to check follow status' },
      { status: 500 }
    );
  }
} 