// src/app/api/User/route.ts
import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    
    console.log('Searching for user with username:', username);

    if (username) {
      // First, let's check all users to see what's in the database
      const allUsers = await prisma.user.findMany({
        select: {
          username: true
        }
      });
      console.log('All users in database:', allUsers);

      const user = await prisma.user.findUnique({
        where: {
          username: username
        }
      });

      console.log('Found user:', user);

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Return all necessary user data
      return NextResponse.json({
        id: user.id,
        username: user.username,
        email: user.email,
        pictureURL: user.pictureURL || '/images/default_avatar.png',
        profileDesc: user.profileDesc || ''
      }, { status: 200 });
    }

    // If no username provided, return all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true
      }
    });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, email, password } = body

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password,
        pictureURL: '/images/default_avatar.png'  // Set default avatar
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create user' },
      { status: 500 }
    );
  }
}
