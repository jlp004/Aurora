import { useState, useEffect } from 'react';
import Header from "../components/Header";
import Post from '../components/Post';
import '../styles/Home.css';
import { useUser } from './userData';

const Home = () => {
  const { currentUser } = useUser();
  const [posts, setPosts] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [initialTimestamps] = useState(() => {
    // Try to get timestamps from localStorage
    const storedTimestamps = localStorage.getItem('postTimestamps');
    if (storedTimestamps) {
      return JSON.parse(storedTimestamps).map((ts: string) => new Date(ts));
    }
    
    // If no stored timestamps, create new ones
    const now = new Date();
    const timestamps = [
      new Date(now.getTime() - 0), // Just now
      new Date(now.getTime() - 1000), // 1 second ago
      new Date(now.getTime() - 2000), // 2 seconds ago
      new Date(now.getTime() - 3000), // 3 seconds ago
      new Date(now.getTime() - 4000), // 4 seconds ago
    ];
    
    // Store the new timestamps
    localStorage.setItem('postTimestamps', JSON.stringify(timestamps));
    return timestamps;
  });
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  const filterPosts = (postsToFilter) => {
    const now = new Date();
    return postsToFilter.filter(post => {
      const postDate = new Date(post.createdAt);
      const diffInMinutes = (now.getTime() - postDate.getTime()) / (1000 * 60);
      
      switch (currentFilter) {
        case '1min':
          return diffInMinutes <= 1;
        case '5min':
          return diffInMinutes <= 5;
        case '1day':
          return diffInMinutes <= 24 * 60;
        case '1week':
          return diffInMinutes <= 7 * 24 * 60;
        default:
          return true;
      }
    });
  };

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
  };

  // Demo posts with current timestamps (only used if no posts from database)
  const demoPosts = [
    {
      id: 1,
      username: "user1234!",
      imageUrl: "../../images/mountain.jpg",
      caption: "Mountain view!",
      likes: 5,
      comments: 2,
      createdAt: initialTimestamps[0],
      currentUserId: currentUser?.id
    },
    {
      id: 2,
      imageUrl: "/images/img2.png",
      caption: "Every day is a new day. Try to smile!",
      username: "nature_lover",
      createdAt: initialTimestamps[1],
      currentUserId: currentUser?.id
    },
    {
      id: 3,
      imageUrl: "/images/img4.png",
      caption: "Beautiful beach spotted on morning run!!",
      username: "coffee_addict",
      createdAt: initialTimestamps[2],
      currentUserId: currentUser?.id
    },
    {
      id: 4,
      imageUrl: "/images/accountPic3.png",
      caption: "Weekend vibes with friends",
      username: "party_person",
      createdAt: initialTimestamps[3],
      currentUserId: currentUser?.id
    },
    {
      id: 5,
      imageUrl: "/images/img3.png",
      caption: "Exploring new places",
      username: "world_explorer",
      createdAt: initialTimestamps[4],
      currentUserId: currentUser?.id
    }
  ];

  const displayPosts = filterPosts(posts.length > 0 ? posts : demoPosts);
  
  return (
    <div className="home-container">
      <Header onFilterChange={handleFilterChange} />
      <div className="post-feed">
        {displayPosts.map((post) => (
          <Post 
            key={post.id}
            id={post.id}
            username={post.username}
            imageUrl={post.imageUrl}
            caption={post.caption}
            likes={post.likes}
            comments={post.comments}
            timePosted={post.createdAt}
            currentUserId={post.currentUserId}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
