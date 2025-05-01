//Written by Charitha Sarraju CXS220054

//updating the bio for user
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { username, Bio } = await req.json();

    if (!username || !Bio) {
      return NextResponse.json({ message: 'Username and bio are required' }, { status: 400 });
    }

    await prisma.user.update({
      where: { username },
      data: { Bio },
    });

    return NextResponse.json({ message: 'Bio updated successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to update bio', error: error.toString() }, { status: 500 });
  }
}
