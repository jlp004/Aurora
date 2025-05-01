import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function exportData() {
  try {
    // Export users with only the fields that exist in the old database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        pictureURL: true,
        profileDesc: true,
        followers: true,
        likes: true
      }
    });
    
    // Export posts with only the fields that exist in the old database
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        pictureURL: true,
        userId: true,
        likes: true
      }
    });
    
    // Save to JSON file
    fs.writeFileSync('data-backup.json', JSON.stringify({
      users,
      posts
    }, null, 2));

    console.log('Data exported successfully!');
  } catch (error) {
    console.error('Error exporting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData(); 