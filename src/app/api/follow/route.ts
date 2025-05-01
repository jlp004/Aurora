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

    // Check if the follow relationship already exists
    const existingFollow = await prisma.user.findFirst({
      where: {
        id: followerId,
        followingUsers: {
          some: {
            id: followingId
          }
        }
      }
    });

    if (existingFollow) {
      return NextResponse.json(
        { error: 'Already following this user' },
        { status: 400 }
      );
    }

    // Create the follow relationship
    await prisma.user.update({
      where: { id: followerId },
      data: {
        followingUsers: {
          connect: { id: followingId }
        },
        following: {
          increment: 1
        }
      }
    });

    // Update the followed user's follower count
    await prisma.user.update({
      where: { id: followingId },
      data: {
        followers: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ message: 'Successfully followed user' });
  } catch (error) {
    console.error('Error following user:', error);
    return NextResponse.json(
      { error: 'Failed to follow user' },
      { status: 500 }
    );
  }
} 