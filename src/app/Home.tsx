import Header from "../components/Header";
import Post from '../components/Post';
import '../styles/Home.css';
import { useEffect, useState } from 'react';
import { useUser } from './userData';

interface PostData {
  id: number;
  title: string;
  pictureURL: string;
  userId: number;
  user: {
    username: string;
  };
  createdAt: string;
  comments: number;
  likes: number;
  isLikedByCurrentUser: boolean;
}

const Home = () => {
  const { currentUser } = useUser();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const fetchPosts = async (tag?: string) => {
    try {
      let url = tag 
        ? `http://localhost:3001/api/posts?tag=${encodeURIComponent(tag)}`
        : 'http://localhost:3001/api/posts';
      
      // Append userId if currentUser exists
      if (currentUser?.id) {
        url += url.includes('?') ? `&userId=${currentUser.id}` : `?userId=${currentUser.id}`;
      }
      
      console.log('Fetching posts from URL:', url); // Log the final URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      
      // Ensure each post has a valid timestamp
      const postsWithValidDates = data.data?.map((post: PostData) => {
        // If no createdAt, use current time as fallback
        if (!post.createdAt) {
          console.error('Post missing createdAt:', post);
          return {
            ...post,
            createdAt: new Date().toISOString()
          };
        }
        
        // Ensure the timestamp is a valid ISO string
        try {
          const date = new Date(post.createdAt);
          if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
          }
          return post;
        } catch (err) {
          console.error('Invalid createdAt format:', post.createdAt);
          return {
            ...post,
            createdAt: new Date().toISOString()
          };
        }
      }) || [];

      setPosts(postsWithValidDates);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(selectedTag || undefined);
    // Refresh posts every minute
    const intervalId = setInterval(() => fetchPosts(selectedTag || undefined), 60000);
    return () => clearInterval(intervalId);
  }, [selectedTag]);

  const predefinedTags = ["Nature", "Food", "Travel", "Fashion", "Sports"];

  const handleTagClick = (tag: string) => {
    // If clicking the same tag that's already selected, deselect it
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
    }
    setLoading(true);
  };

  if (loading) {
    return (
      <div className="home-container">
        <Header />
        <div className="home-tags-bar">
          <div className="tag-buttons">
            {predefinedTags.map(tag => (
              <button 
                key={tag} 
                className={`tag-btn ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className="post-feed">
          <p>Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <Header />
        <div className="home-tags-bar">
          <div className="tag-buttons">
            {predefinedTags.map(tag => (
              <button 
                key={tag} 
                className={`tag-btn ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className="post-feed">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <Header />
      <div className="home-tags-bar">
        <div className="tag-buttons">
          {predefinedTags.map(tag => (
            <button 
              key={tag} 
              className={`tag-btn ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className="post-feed">
        {posts.map((post) => (
          <Post
            key={post.id}
            id={post.id}
            imageUrl={post.pictureURL}
            caption={post.title}
            username={post.user.username}
            timePosted={post.createdAt}
            currentUserId={currentUser?.id}
            comments={post.comments}
            likes={post.likes}
            isLikedByCurrentUser={post.isLikedByCurrentUser}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;