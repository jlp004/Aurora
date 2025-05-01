import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function importData() {
  try {
    // Read the backup data
    const data = JSON.parse(fs.readFileSync('data-backup.json', 'utf8'));
    
    // Import users first
    for (const user of data.users) {
      await prisma.user.create({
        data: {
          username: user.username,
          email: user.email,
          password: user.password,
          pictureURL: user.pictureURL,
          profileDesc: user.profileDesc,
          followers: user.followers || 0,
          following: user.following || 0,
          likes: user.likes || 0
        }
      });
    }
    
    // Import posts
    for (const post of data.posts) {
      await prisma.post.create({
        data: {
          title: post.title,
          pictureURL: post.pictureURL,
          userId: post.userId,
          likes: post.likes || 0
        }
      });
    }

    console.log('Data imported successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData(); 