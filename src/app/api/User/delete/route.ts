import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db'; // Prisma setup for database connection

export async function DELETE(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ message: 'Username required' }, { status: 400 });
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // If user exists, delete the user
    await prisma.user.delete({
      where: { username },
    });

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (err: any) {
    console.error('Error deleting user:', err);
    return NextResponse.json({ message: 'Failed to delete user', error: err.message }, { status: 500 });
  }
}
