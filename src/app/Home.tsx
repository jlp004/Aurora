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
}

const Home = () => {
  const { currentUser } = useUser();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/posts');
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
    fetchPosts();
    // Refresh posts every minute
    const intervalId = setInterval(fetchPosts, 60000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="home-container">
        <Header />
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
        <div className="post-feed">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <Header />
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
          />
        ))}
      </div>
    </div>
  );
};

export default Home;