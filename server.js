import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Prisma } from '@prisma/client';
import { URLSearchParams } from 'url';

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

// Get ALL users (for leaderboard)
app.get('/api/User', async (req, res) => {
  try {
    console.log('Fetching all users for leaderboard');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        pictureURL: true,
        // Assuming 'likes' and 'followers' are direct fields or relations that Prisma can count/select
        // If they are relations (e.g., posts liked by user, followers list), you might need to adjust the query
        // For now, assuming simple numeric fields exist on the User model
        likes: true,      // Make sure 'likes' field exists in your Prisma schema
        followers: true   // Make sure 'followers' field exists in your Prisma schema
      },
      // Optionally order by likes/followers in the query itself, though frontend also sorts
      // orderBy: {
      //   likes: 'desc'
      // }
    });

    if (!users || users.length === 0) {
      console.log('No users found in database.');
      return res.status(404).json({ 
        message: 'No users found',
        users: []
      });
    }

    console.log(`Found ${users.length} users.`);
    // The frontend expects a direct array, not nested under 'users' key based on its logic
    return res.status(200).json(users);

  } catch (error) {
    console.error('Error fetching all users:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch users: ' + error.message,
      details: error.message,
      users: []
    });
  }
});

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
          profileDesc: "No bio yet", // Optional in schema
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
        password: true,  // Only select password, not passwordHash
        pictureURL: true,
        profileDesc: true,
        followers: true,
        following: true
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

// Get user by ID
app.get('/api/User/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Searching for user ID:', id);
    
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id)
      },
      select: {
        id: true,
        username: true,
        email: true,
        pictureURL: true,
        profileDesc: true,
        followers: true,
        following: true
      }
    });

    console.log('Found user:', user);

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        users: []
      });
    }
    
    return res.status(200).json({ 
      users: [user]
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch user',
      users: []
    });
  }
});

// Get user by username (for profile/account page)
app.get('/api/User/username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        pictureURL: true,
        profileDesc: true,
        followers: true,
        following: true
      }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found', users: [] });
    }
    return res.status(200).json({ users: [user] });
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return res.status(500).json({ message: 'Failed to fetch user', users: [] });
  }
});

// Endpoint to get users followed by a specific user
app.get('/api/user/:id/following', async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`Fetching following list for user ID: ${id}`); // Add log
    
    // Convert to number and validate
    const userId = Number(id);
    if (isNaN(userId)) {
      return res.status(400).json({ 
        message: 'Invalid user ID format', 
        users: [] 
      });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { // Select the nested list of users they are following
        followingUsers: { 
          select: { // Select the fields needed for the modal
            id: true,
            username: true,
            pictureURL: true,
            profileDesc: true,
            email: true
          }
        }
      }
    });
    
    if (!user) {
      console.log(`User ${id} not found when fetching following list.`);
      return res.status(404).json({ 
        message: 'User not found',
        users: []
      });
    }

    console.log(`Found ${user.followingUsers.length} users followed by user ${id}.`);
    return res.status(200).json({ 
      users: user.followingUsers // Return the list nested under 'users' key
    });

  } catch (error) {
    console.error(`Error fetching following for user ${id}:`, error);
    return res.status(500).json({ 
      message: 'Failed to fetch following list',
      users: []
    });
  }
});

// Endpoint to get followers of a specific user
app.get('/api/user/:id/followers', async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`Fetching followers list for user ID: ${id}`); // Add log
    
    // Convert to number and validate
    const userId = Number(id);
    if (isNaN(userId)) {
      return res.status(400).json({ 
        message: 'Invalid user ID format', 
        users: [] 
      });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { // Select the nested list of users who follow them
        followedByUsers: { 
          select: { // Select the fields needed for the modal
            id: true,
            username: true,
            pictureURL: true,
            profileDesc: true,
            email: true
          }
        }
      }
    });

    if (!user) {
      console.log(`User ${id} not found when fetching followers list.`);
      return res.status(404).json({ 
        message: 'User not found',
        users: []
      });
    }

    console.log(`Found ${user.followedByUsers.length} followers for user ${id}.`);
    return res.status(200).json({ 
      users: user.followedByUsers // Return the list nested under 'users' key
    });

  } catch (error) {
    console.error(`Error fetching followers for user ${id}:`, error);
    return res.status(500).json({ 
      message: 'Failed to fetch followers list',
      users: []
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

// Update user email, password, and bio
app.post('/api/User/update', async (req, res) => {
  try {
    const { oldUsername, username, email, password, bio } = req.body;
    if (!oldUsername || !username) {
      return res.status(400).json({ message: 'Old and new username are required' });
    }
    // Find user by old username
    const user = await prisma.user.findUnique({ where: { username: oldUsername } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // If username is changing, check for uniqueness
    if (oldUsername !== username) {
      const existingUser = await prisma.user.findUnique({ where: { username } });
      if (existingUser) {
        return res.status(409).json({ message: 'Username already taken' });
      }
    }
    const updatedUser = await prisma.user.update({
      where: { username: oldUsername },
      data: {
        ...(username && { username }),
        ...(email && { email }),
        ...(password && { password }),
        ...(bio && { profileDesc: bio }),
      }
    });
    const { password: _, ...userWithoutPassword } = updatedUser;
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Failed to update user: ' + error.message });
  }
});

// === Post Endpoints ===

// Like/Unlike a post
app.post('/api/Post/:id/like', async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const { userId } = req.body; // User doing the liking

    if (!userId || !postId) {
      return res.status(400).json({ 
        error: 'User ID and Post ID are required' 
      });
    }

    // Find the post and the user who owns it
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true, likedBy: { where: { id: Number(userId) } } } // Check if already liked by this user
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const postOwnerId = post.userId;
    const isAlreadyLiked = post.likedBy.length > 0;

    let updatedPost;
    let finalLikes;
    let finalIsLiked;

    if (isAlreadyLiked) {
      // --- Unlike --- 
      console.log(`User ${userId} unliking post ${postId}`);
      updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          likes: { decrement: 1 },
          likedBy: { disconnect: { id: Number(userId) } } // Remove relation
        },
        select: { likes: true } // Select the updated likes count
      });
      // Decrement likes count on the post owner's profile
      await prisma.user.update({
        where: { id: postOwnerId },
        data: { likes: { decrement: 1 } }
      });
      finalLikes = updatedPost.likes;
      finalIsLiked = false;
    } else {
      // --- Like --- 
      console.log(`User ${userId} liking post ${postId}`);
      updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          likes: { increment: 1 },
          likedBy: { connect: { id: Number(userId) } } // Add relation
        },
        select: { likes: true } // Select the updated likes count
      });
      // Increment likes count on the post owner's profile
      await prisma.user.update({
        where: { id: postOwnerId },
        data: { likes: { increment: 1 } }
      });
      finalLikes = updatedPost.likes;
      finalIsLiked = true;
    }

    console.log(`Post ${postId} now has ${finalLikes} likes. User ${userId} liked: ${finalIsLiked}`);
    return res.status(200).json({ 
      likes: finalLikes, 
      isLiked: finalIsLiked 
    });

  } catch (error) {
    console.error(`Error liking/unliking post:`, error);
    return res.status(500).json({ 
      error: 'Failed to update like status', 
      details: error.message 
    });
  }
});

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const { tag, userId } = req.query; // Get optional userId
    const currentUserId = userId ? Number(userId) : null;
    console.log('Fetching posts with:', { tag, currentUserId });

    const posts = await prisma.post.findMany({
      where: tag ? { tag } : {},
      select: {
        id: true,
        title: true,
        pictureURL: true,
        userId: true,
        tag: true,
        createdAt: true,
        likes: true,
        user: { 
          select: {
            username: true,
            pictureURL: true
          }
        },
        _count: {
          select: { Comment: true }
        },
        // Conditionally check likedBy relation if currentUserId is provided
        likedBy: currentUserId 
          ? { where: { id: currentUserId }, select: { id: true } } 
          : false // If no userId, don't need to fetch this relation
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Map the results to include comment count and isLikedByCurrentUser flag
    const postsWithDetails = posts.map(post => ({
      ...post,
      comments: post._count.Comment,
      // Determine if the current user liked this post based on the likedBy check
      isLikedByCurrentUser: currentUserId ? post.likedBy.length > 0 : false,
      // Remove the potentially large likedBy array from the final response
      likedBy: undefined 
    }));

    return res.status(200).json({ 
      data: postsWithDetails // Return the modified array
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
    const { q: query, timeFilter } = req.query;
    console.log('Search request:', { query, timeFilter });
    
    // First get all posts that match the query
    const posts = await prisma.post.findMany({
      where: query ? { title: { contains: query } } : {},
      include: {
        user: {
          select: {
            username: true,
            pictureURL: true
          }
        },
        _count: {
          select: { Comment: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Then filter by time if needed
    let filteredPosts = posts;
    if (timeFilter && timeFilter !== 'all') {
      const now = new Date();
      const cutoffTime = new Date(now);
      
      switch (timeFilter) {
        case 'lastMinute':
          cutoffTime.setMinutes(now.getMinutes() - 1);
          break;
        case 'lastDay':
          cutoffTime.setHours(now.getHours() - 24);
          break;
        case 'lastWeek':
          cutoffTime.setDate(now.getDate() - 7);
          break;
      }
      
      console.log('Time filter:', {
        filter: timeFilter,
        cutoffTime: cutoffTime.toISOString(),
        currentTime: now.toISOString()
      });

      filteredPosts = posts.filter(post => {
        const postDate = new Date(post.createdAt);
        return postDate >= cutoffTime && postDate <= now;
      });

      console.log('Posts after time filtering:', filteredPosts.map(post => ({
        id: post.id,
        title: post.title,
        createdAt: post.createdAt.toISOString()
      })));
    }

    // Format dates to ISO strings and add comment count
    const formattedPosts = filteredPosts.map(post => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      comments: post._count.Comment
    }));

    res.json({ data: formattedPosts });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      message: 'Failed to search posts',
      error: error.message 
    });
  }
});

// Get posts by user ID
app.get('/api/posts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentUserId } = req.query; // Add parameter to get current user ID
    
    const posts = await prisma.post.findMany({
      where: { 
        userId: Number(userId) 
      },
      select: {
        id: true,
        title: true,
        pictureURL: true,
        userId: true,
        tag: true,
        createdAt: true,
        likes: true,
        user: {
          select: {
            username: true
          }
        },
        _count: {
          select: { Comment: true }
        },
        // Check if current user has liked this post
        likedBy: currentUserId ? {
          where: { id: Number(currentUserId) },
          select: { id: true }
        } : undefined
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Format the posts with ISO string dates and comment count
    const formattedPosts = posts.map(post => {
      const createdAt = post.createdAt.toISOString();
      return {
        ...post,
        createdAt,
        comments: post._count.Comment,
        isLikedByCurrentUser: currentUserId ? post.likedBy?.length > 0 : false,
        likedBy: undefined // Remove likedBy from response
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
    const { title, tag, userId, pictureURL } = req.body;
    
    // Validate input
    if (!title || !userId) {
      return res.status(400).json({ 
        message: 'Title and userId are required' 
      });
    }
    
    // Create post with current timestamp
    const post = await prisma.post.create({
      data: {
        title,
        pictureURL: pictureURL || '',
        userId: Number(userId),
        tag: tag || '',
        createdAt: new Date() // Store as Date object, Prisma will handle the conversion
      }
    });
    
    console.log('Post created successfully:', post);
    return res.status(201).json(post);
  } catch (error) {
    console.error('Detailed error creating post:', error);
    return res.status(500).json({ 
      message: 'Failed to create post',
      error: error.message 
    });
  }
});

// Update a post
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Only expect title and tags (as string) in the body now
    const { title, tags } = req.body; 
    
    const updateData = {};
    if (title) updateData.title = title;
    if (tags !== undefined) updateData.tag = tags; // Update tag field if tags string is provided (even if empty)

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No update data provided' });
    }

    console.log(`Updating post ${id} with data:`, updateData);

    const post = await prisma.post.update({
      where: { id: Number(id) },
      data: updateData // Use the dynamically built updateData object
    });
    
    return res.status(200).json(post);
  } catch (error) {
    // Log more detailed error information
    console.error(`Error updating post ${req.params.id}:`, error);
    let errorMessage = 'Failed to update post';
    let errorDetails = null;

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle known Prisma errors (e.g., record not found, constraint violation)
        errorMessage = `Database error: ${error.code}`;
        errorDetails = error.meta;
        console.error(`Prisma Error Code: ${error.code}, Meta:`, error.meta);
        if (error.code === 'P2025') { // Record to update not found
            return res.status(404).json({ message: 'Post not found' });
        }
    } else if (error instanceof Error) {
        errorDetails = error.message;
    }

    return res.status(500).json({ 
      message: errorMessage,
      details: errorDetails 
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
    
    // Generate a cache-busting version of the URL
    const timestamp = Date.now();
    const cacheBustUrl = `${imageUrl}?t=${timestamp}`;
    
    return res.status(200).json({
      message: 'Profile picture uploaded successfully',
      imageUrl: cacheBustUrl,
      userId: user.id,
      success: true
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

// Check profile picture - for debugging
app.get('/api/user/check-profile-pic/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get user from database to check pictureURL
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { pictureURL: true, username: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.status(200).json({
      username: user.username,
      pictureURL: user.pictureURL,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking profile picture:', error);
    return res.status(500).json({ error: 'Failed to check profile picture' });
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

// === Comment Endpoints ===

// Get all comments for a specific post
app.get('/api/Comment/post/:postId', async (req, res) => {
  const { postId } = req.params;
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: Number(postId) },
      include: { poster: true }
    });
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
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
      },
      include: { poster: true }
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
});

// === Chat Endpoints ===

// Get chat history between two users (using usernames)
app.get('/api/chat/history', async (req, res) => {
  try {
    // Expect usernames in query parameters now
    const { username1, username2 } = req.query; 

    console.log('[GET /api/chat/history] Received query params:', req.query);

    if (!username1 || !username2) {
      console.error('[GET /api/chat/history] Validation failed: One or both usernames missing.');
      return res.status(400).json({ error: 'Missing username1 or username2 query parameter' });
    }

    // Find users by username to get their IDs
    const user1 = await prisma.user.findUnique({ where: { username: username1 }, select: { id: true } });
    const user2 = await prisma.user.findUnique({ where: { username: username2 }, select: { id: true } });

    if (!user1 || !user2) {
      console.error(`[GET /api/chat/history] User lookup failed: user1 found=${!!user1}, user2 found=${!!user2}`);
      return res.status(404).json({ error: 'One or both users not found' });
    }

    const user1Id = user1.id;
    const user2Id = user2.id;
    console.log(`[GET /api/chat/history] Found IDs: user1Id=${user1Id}, user2Id=${user2Id}`);

    // Use the found IDs for the Prisma query
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user1Id, receiverId: user2Id },
          { senderId: user2Id, receiverId: user1Id },
        ],
      },
      orderBy: {
        createdAt: 'asc', // Order messages chronologically
      },
      // include: { // Optionally include sender/receiver details 
      //   sender: { select: { username: true, pictureURL: true } },
      //   receiver: { select: { username: true, pictureURL: true } }
      // }
    });

    console.log(`[GET /api/chat/history] Found ${messages.length} messages between ${username1} and ${username2}`);
    return res.status(200).json(messages);

  } catch (error) {
    console.error(`Error fetching chat history between ${req.query.username1} and ${req.query.username2}:`, error);
    return res.status(500).json({ 
        error: 'Failed to fetch chat history',
        details: error.message
     });
  }
});

// Send a message
app.post('/api/chat/send', async (req, res) => {
  const { senderId, receiverId, content } = req.body;

  if (!senderId || !receiverId || !content) {
    return res.status(400).json({ 
        error: 'Missing senderId, receiverId, or content in request body' 
    });
  }

  const senderNumId = Number(senderId);
  const receiverNumId = Number(receiverId);

  if (isNaN(senderNumId) || isNaN(receiverNumId)) {
    return res.status(400).json({ error: 'Invalid senderId or receiverId' });
  }

  try {
    const newMessage = await prisma.message.create({
      data: {
        senderId: senderNumId,
        receiverId: receiverNumId,
        content: content,
      },
    });

    // Optionally: Emit message via WebSocket/Socket.IO here for real-time updates

    return res.status(201).json(newMessage); // Return the created message
  } catch (error) {
    console.error(`Error sending message from ${senderId} to ${receiverId}:`, error);
    return res.status(500).json({ 
        error: 'Failed to send message',
        details: error.message
     });
  }
});

// Search users for chat
app.get('/api/chat/search-users', async (req, res) => {
  try {
    const { query } = req.query;
    console.log('Searching users with query:', query);

    const users = await prisma.user.findMany({
      where: query ? {
        username: {
          contains: query.toLowerCase()
        }
      } : {},
      select: {
        id: true,
        username: true,
        pictureURL: true
      }
    });

    // Filter results case-insensitively
    const filteredUsers = query 
      ? users.filter(user => 
          user.username.toLowerCase().includes(query.toLowerCase())
        )
      : users;

    res.json({ users: filteredUsers });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ 
      message: 'Failed to search users',
      error: error.message 
    });
  }
});

// Get recent chat users for a user
app.get('/api/chat/recent/:userId', async (req, res) => {
  const { userId } = req.params;
  const currentUserId = Number(userId);

  if (isNaN(currentUserId)) {
    return res.status(400).json({ error: 'Invalid userId parameter' });
  }

  try {
    // Find all messages involving the current user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId },
          { receiverId: currentUserId },
        ],
      },
      // Include sender and receiver details for easier processing
      include: {
        sender: { select: { id: true, username: true, pictureURL: true } },
        receiver: { select: { id: true, username: true, pictureURL: true } },
      },
      orderBy: {
        createdAt: 'desc', // Get latest messages first to determine recency
      },
    });

    // Process messages to find unique partners and latest message time
    const chatPartners = new Map(); // Map to store latest message time per partner
    const partnerDetails = new Map(); // Map to store partner details

    messages.forEach(message => {
      const partner = message.senderId === currentUserId ? message.receiver : message.sender;
      // Ensure partner is not null and not the user themselves
      if (partner && partner.id !== currentUserId) {
          if (!chatPartners.has(partner.id)) {
              chatPartners.set(partner.id, message.createdAt);
              partnerDetails.set(partner.id, partner);
          }
          // Since messages are ordered desc, the first time we see a partner, 
          // it's associated with their most recent message.
      }
    });

    // Convert map to an array sorted by most recent message
    const recentChats = Array.from(partnerDetails.values()).sort((a, b) => {
        const timeA = chatPartners.get(a.id);
        const timeB = chatPartners.get(b.id);
        // Sort descending: more recent messages first
        return new Date(timeB).getTime() - new Date(timeA).getTime(); 
    });

    console.log(`[GET /api/chat/recent/${userId}] Found ${recentChats.length} recent chats.`);
    res.status(200).json({ users: recentChats });

  } catch (error) {
    console.error(`Error fetching recent chats for user ${userId}:`, error);
    res.status(500).json({ error: 'Failed to fetch recent chats', details: error.message });
  }
});

// === Follow/Unfollow Endpoints ===

// Check if a user is following another user
app.post('/api/isFollowing', async (req, res) => {
  try {
    const { followerId, followingId } = req.body;

    if (!followerId || !followingId) {
      return res.status(400).json({ error: 'Both followerId and followingId are required' });
    }

    // Convert IDs to numbers
    const followerNumId = Number(followerId);
    const followingNumId = Number(followingId);

    if (isNaN(followerNumId) || isNaN(followingNumId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Check if the follow relationship exists
    const existingFollow = await prisma.user.findFirst({
      where: {
        id: followerNumId,
        followingUsers: {
          some: {
            id: followingNumId
          }
        }
      }
    });

    return res.status(200).json({ isFollowing: !!existingFollow });
  } catch (error) {
    console.error('Error checking follow status:', error);
    return res.status(500).json({ error: 'Failed to check follow status', details: error.message });
  }
});

// Follow a user
app.post('/api/follow', async (req, res) => {
  try {
    const { followerId, followingId } = req.body;

    if (!followerId || !followingId) {
      return res.status(400).json({ error: 'Both followerId and followingId are required' });
    }

    // Convert IDs to numbers
    const followerNumId = Number(followerId);
    const followingNumId = Number(followingId);

    if (isNaN(followerNumId) || isNaN(followingNumId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Check if already following
    const existingFollow = await prisma.user.findFirst({
      where: {
        id: followerNumId,
        followingUsers: {
          some: {
            id: followingNumId
          }
        }
      }
    });

    if (existingFollow) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Create the follow relationship
    await prisma.user.update({
      where: { id: followerNumId },
      data: {
        followingUsers: {
          connect: { id: followingNumId }
        },
        following: {
          increment: 1
        }
      }
    });

    // Update the followed user's follower count
    await prisma.user.update({
      where: { id: followingNumId },
      data: {
        followers: {
          increment: 1
        }
      }
    });

    return res.status(200).json({ message: 'Successfully followed user' });
  } catch (error) {
    console.error('Error following user:', error);
    return res.status(500).json({ error: 'Failed to follow user', details: error.message });
  }
});

// Unfollow a user
app.post('/api/unfollow', async (req, res) => {
  try {
    const { followerId, followingId } = req.body;

    if (!followerId || !followingId) {
      return res.status(400).json({ error: 'Both followerId and followingId are required' });
    }

    // Convert IDs to numbers
    const followerNumId = Number(followerId);
    const followingNumId = Number(followingId);

    if (isNaN(followerNumId) || isNaN(followingNumId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Check if the follow relationship exists
    const existingFollow = await prisma.user.findFirst({
      where: {
        id: followerNumId,
        followingUsers: {
          some: {
            id: followingNumId
          }
        }
      }
    });

    if (!existingFollow) {
      return res.status(400).json({ error: 'Not following this user' });
    }

    // Remove the follow relationship
    await prisma.user.update({
      where: { id: followerNumId },
      data: {
        followingUsers: {
          disconnect: { id: followingNumId }
        },
        following: {
          decrement: 1
        }
      }
    });

    // Update the unfollowed user's follower count
    await prisma.user.update({
      where: { id: followingNumId },
      data: {
        followers: {
          decrement: 1
        }
      }
    });

    return res.status(200).json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return res.status(500).json({ error: 'Failed to unfollow user', details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});