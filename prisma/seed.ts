// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user1 = await prisma.user.create({
    data: {
      username: 'megantest',
      email: 'megantest@gmail.com',
      password: 'secure123',
      pictureURL: null,
      profileDesc: 'Just a dev testing this app!',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'coderfriend',
      email: 'friend@example.com',
      password: 'testpass',
      pictureURL: null,
      profileDesc: 'Friend for testing follows!',
    },
  });

  // make user1 follow user2
  await prisma.user.update({
    where: { id: user1.id },
    data: {
      following: {
        connect: { id: user2.id }
      }
    }
  });
}

main()
  .then(() => {
    console.log('✅ Seed data inserted');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    return prisma.$disconnect();
  });
