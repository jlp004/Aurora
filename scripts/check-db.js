import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('\n=== Users ===');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        pictureURL: true,
        profileDesc: true,
        followers: true,
        following: true,
        likes: true
      }
    });
    console.log(JSON.stringify(users, null, 2));

    console.log('\n=== Posts ===');
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        pictureURL: true,
        userId: true,
        likes: true
      }
    });
    console.log(JSON.stringify(posts, null, 2));
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 