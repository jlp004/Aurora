import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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
app.get('/api/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        // Don't return password
      }
    });
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch user' 
    });
  }
});

// === Post Endpoints ===

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
      }
    });
    
    return res.status(200).json(posts);
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
    const { title, content, tags, userId } = req.body;
    
    // Validate input
    if (!title || !userId) {
      return res.status(400).json({ 
        message: 'Title and userId are required' 
      });
    }
    
    const post = await prisma.post.create({
      data: {
        title,
        content: content || '',
        tags: tags || '',
        pictureURL: '', // Default empty string
        userId: Number(userId)
      }
    });
    
    return res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({ 
      message: 'Failed to create post' 
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

// Add error handler middleware at the end
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Server error occurred',
    error: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 