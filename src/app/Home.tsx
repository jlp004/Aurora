import Header from "../components/Header";
import Post from '../components/Post';
import '../styles/Home.css';
import { useEffect, useState } from 'react';

interface PostData {
  id: number;
  title: string;
  pictureURL: string;
  userId: number;
  user: {
    username: string;
  };
  createdAt: string;
}

const Home = () => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/posts');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
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
            imageUrl={post.pictureURL}
            caption={post.title}
            username={post.user.username}
            timePosted={new Date(post.createdAt).toLocaleDateString()}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;