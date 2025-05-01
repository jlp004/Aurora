/**
 * API utility functions for the frontend
 */

const API_BASE_URL = 'http://localhost:5173';

// User API functions

/**
 * Create a new user account
 */
export const createUser = async (username: string, email: string, password: string) => {
  try {
    console.log('API: Sending signup request to /api/signup');
    
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    
    console.log('API: Received signup response status:', response.status);
        
    // Debug response
    const responseText = await response.text();
    console.log('API: Response text:', responseText);
    
    let data;
    try {
      // Try to parse the response as JSON
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error('API: Failed to parse response as JSON:', parseError);
      throw new Error(`Server returned invalid JSON: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create account');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Login with username and password
 */
export const loginUser = async (username: string, password: string) => {
  try {
    console.log('API: Sending login request to /api/login');
    
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    console.log('API: Received login response status:', response.status);
    
        
    // Debug response
    const responseText = await response.text();
    console.log('API: Response text:', responseText);
    
    let data;
    try {
      // Try to parse the response as JSON
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error('API: Failed to parse response as JSON:', parseError);
      throw new Error(`Server returned invalid JSON: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Get user details by username
 */
export const getUserByUsername = async (username: string) => {
  try {
    const response = await fetch(`/api/user/${username}`);
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to fetch user');
    }
    
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Post API functions

/**
 * Get posts for a specific user
 */
export const getPostsByUserId = async (userId: number) => {
  try {
    const response = await fetch(`/api/posts/${userId}`);
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to fetch posts');
    }
    
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Create a new post
 */
export const createPost = async (title: string, content: string, tags: string, userId: number) => {
  try {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, tags, userId })
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to create post');
    }
    
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Update an existing post
 */
export const updatePost = async (postId: number, updates: { title?: string, content?: string, tags?: string }) => {
  try {
    const response = await fetch(`/api/posts/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to update post');
    }
    
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}; 