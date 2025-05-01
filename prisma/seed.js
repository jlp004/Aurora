import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const user = await prisma.user.create({
    data: {
      username: 'test_user',
      email: 'test@example.com',
      password: 'password123',
      pictureURL: '/images/profile-pic.jpg',
      profileDesc: 'Test user for development',
    },
  });

  // Create some test posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: 'First Post',
        pictureURL: '/images/img1.png',
        userId: user.id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Second Post',
        pictureURL: '/images/img2.png',
        userId: user.id,
      },
    }),
  ]);

  console.log('Seed data created:', { user, posts });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 