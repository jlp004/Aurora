import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true
      }
    });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error listing users:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list users' },
      { status: 500 }
    );
  }
} 