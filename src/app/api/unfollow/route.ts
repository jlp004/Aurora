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

    // Check if the follow relationship exists
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

    if (!existingFollow) {
      return NextResponse.json(
        { error: 'Not following this user' },
        { status: 400 }
      );
    }

    // Remove the follow relationship
    await prisma.user.update({
      where: { id: followerId },
      data: {
        followingUsers: {
          disconnect: { id: followingId }
        },
        following: {
          decrement: 1
        }
      }
    });

    // Update the unfollowed user's follower count
    await prisma.user.update({
      where: { id: followingId },
      data: {
        followers: {
          decrement: 1
        }
      }
    });

    return NextResponse.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return NextResponse.json(
      { error: 'Failed to unfollow user' },
      { status: 500 }
    );
  }
} 