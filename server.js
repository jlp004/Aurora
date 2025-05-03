import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

// Ensure images directory exists
const imagesDir = path.join(process.cwd(), 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

app.use(cors());
app.use(express.json());
// Serve static files from the public directory
app.use('/public/images', express.static(path.join(process.cwd(), 'public', 'images')));
app.use('/images', express.static(path.join(process.cwd(), 'public', 'images'))); // Keep this for backward compatibility

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  next();
});

// === User Endpoints ===

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Create user endpoint (signup)
app.post('/api/signup', async (req, res) => {
  try {
    console.log('API: Creating user');
    const { username, email, password } = req.body;
    
    console.log('Creating user:', { username, email });
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Missing required fields' 
      });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(409).json({ 
        message: 'Username or email already exists' 
      });
    }
    
    // Try to create new user
    try {
      // Create the user with all required fields from the schema
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password, // Required field in schema
          pictureURL: null, // Optional in schema
          profileDesc: null, // Optional in schema
        }
      });
      
      // Don't return the password
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(201).json(userWithoutPassword);
    } catch (dbError) {
      // Log the detailed database error
      console.error('Database error details:', dbError);
      
      if (dbError.code === 'P2002') {
        return res.status(409).json({
          message: 'Username or email already exists (constraint violation)'
        });
      }
      
      if (dbError.meta?.target) {
        return res.status(400).json({
          message: `Invalid data for field(s): ${dbError.meta.target.join(', ')}`
        });
      }
      
      throw dbError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ 
      message: 'Failed to create account: ' + error.message,
      details: error.message
    });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login attempt for user:', username);
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Username and password are required' 
      });
    }
    
    // Find user - remove passwordHash from select
    const user = await prisma.user.findFirst({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        password: true  // Only select password, not passwordHash
      }
    });
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }
    
    // Check password
    if (user.password !== password) {
      return res.status(401).json({ 
        message: 'Invalid password' 
      });
    }
    
    // Don't return the password
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(200).json({ 
      user: userWithoutPassword, 
      message: 'Login successful' 
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      message: 'Authentication failed: ' + error.message,
      details: error.message
    });
  }
});

// Get user by username
app.get('/api/User/:username', async (req, res) => {
  try {
    const { username } = req.params;
    console.log('Searching for username:', username);
    
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: username
        }
      },
      select: {
        id: true,
        username: true,
        email: true,
        pictureURL: true,
        profileDesc: true
      }
    });
    
    console.log('Found users:', users);
    
    return res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch users' 
    });
  }
});

// Update user settings
app.put('/api/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, profileDesc } = req.body;
    
    console.log('Updating user:', { id, username, profileDesc });
    
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        ...(username && { username }),
        ...(profileDesc && { profileDesc })
      }
    });
    
    // Don't return the password
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ 
      message: 'Failed to update user settings',
      details: error.message 
    });
  }
});

// === Post Endpoints ===

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Send the raw timestamps without modification
    return res.status(200).json({ 
      data: posts
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch posts' 
    });
  }
});

// Search posts by query - MUST BE BEFORE :userId route
app.get('/api/posts/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(200).json({ posts: [] });
    }
    
    const posts = await prisma.post.findMany({
      where: {
        title: {
          contains: q
        }
      },
      include: {
        user: {
          select: {
            username: true
          }
        }
      }
    });
    
    return res.status(200).json({ posts });
  } catch (error) {
    console.error('Error searching posts:', error);
    return res.status(500).json({ 
      message: 'Failed to search posts' 
    });
  }
});

// Get posts by user ID
app.get('/api/posts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const posts = await prisma.post.findMany({
      where: { 
        userId: Number(userId) 
      },
      include: {
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Format the posts with ISO string dates
    const formattedPosts = posts.map(post => {
      const createdAt = post.createdAt.toISOString();
      return {
        ...post,
        createdAt
      };
    });
    
    return res.status(200).json(formattedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch posts' 
    });
  }
});

// Create a post
app.post('/api/posts', async (req, res) => {
  try {
    console.log('Received post data:', req.body);
    const { title, tags, userId, pictureURL } = req.body;
    
    // Validate input
    if (!title || !userId) {
      return res.status(400).json({ 
        message: 'Title and userId are required' 
      });
    }
    
    // Create post with explicit timestamp
    const post = await prisma.post.create({
      data: {
        title,
        pictureURL: pictureURL || '',
        userId: Number(userId),
        createdAt: new Date().toISOString() // Store as ISO string
      }
    });
    
    console.log('Post created successfully:', post);
    return res.status(201).json(post);
  } catch (error) {
    console.error('Detailed error creating post:', error);
    return res.status(500).json({ 
      message: 'Failed to create post',
      details: error.message 
    });
  }
});

// Update a post
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    
    const post = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(tags && { tags })
      }
    });
    
    return res.status(200).json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    return res.status(500).json({ 
      message: 'Failed to update post' 
    });
  }
});

// Delete a post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First delete any comments associated with the post
    await prisma.comment.deleteMany({
      where: { postId: Number(id) }
    });
    
    // Then delete the post
    const post = await prisma.post.delete({
      where: { id: Number(id) }
    });
    
    return res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return res.status(500).json({ 
      message: 'Failed to delete post' 
    });
  }
});

// === File Upload Endpoints ===

// Upload profile picture
app.post('/api/upload/profile', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const imageUrl = `/public/images/${req.file.filename}`;
    
    // Update user profile picture in database
    const user = await prisma.user.update({
      where: { id: Number(userId) },
      data: { pictureURL: imageUrl }
    });
    
    return res.status(200).json({
      message: 'Profile picture uploaded successfully',
      imageUrl
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

// Upload post image
app.post('/api/upload/post', upload.single('image'), async (req, res) => {
  try {
    console.log('Upload request received:', req.file ? 'File found' : 'No file');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `/public/images/${req.file.filename}`;
    console.log('Image uploaded successfully:', imageUrl);
    
    return res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Create a comment for a specific post
app.post('/api/Comment/post/:postId', async (req, res) => {
  const { postId } = req.params;
  const { text, posterId, parentId } = req.body;

  if (!text || !posterId) {
    return res.status(400).json({ error: 'Missing text or posterId' });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        text,
        posterId: Number(posterId),
        postId: Number(postId),
        parentId: parentId ?? null
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});


// Error handling middleware for multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    console.error('Multer error:', err);
    return res.status(400).json({ 
      error: `Upload error: ${err.message}` 
    });
  } else if (err) {
    // An unknown error occurred
    console.error('Server error:', err);
    return res.status(500).json({ 
      error: `Server error: ${err.message}` 
    });
  }
  next();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 