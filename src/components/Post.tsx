/* Written by Megan Chacko - msc220005 */

import { useState, useEffect } from 'react';
import '../styles/Post.css'; 
import { Link } from 'react-router-dom';

interface Comment {
  id: number;
  text: string;
  poster: {
    username: string;
  };
  createdAt: string;
}

interface PostProps {
  id?: number;
  username?: string;
  imageUrl?: string;
  caption?: string;
  likes?: number;
  comments?: number;
  timePosted?: string | Date;
  currentUserId?: string | number;
}

const getStoredTimestamp = (postId: number): string | null => {
  return localStorage.getItem(`post_${postId}_timestamp`);
};

const storeTimestamp = (postId: number, timestamp: string) => {
  localStorage.setItem(`post_${postId}_timestamp`, timestamp);
};

const ensureDate = (timestamp: string | Date): Date => {
  return timestamp instanceof Date ? timestamp : new Date(timestamp);
};

const calculateTimeDiff = (timestamp: string | Date): number => {
  const postDate = ensureDate(timestamp);
  return Math.floor((new Date().getTime() - postDate.getTime()) / 1000);
};

const formatTimeAgo = (seconds: number): string => {
  if (seconds < 0) return 'just now';
  
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (minutes < 1) {
    return `${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`;
  }
  if (hours < 1) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (days < 1) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (days < 7) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  
  return ensureDate(new Date(Date.now() - seconds * 1000)).toLocaleDateString();
};

export default function Post({
  username = "user1234!",
  imageUrl = "../../images/mountain.jpg",
  caption = "Mountain view!",
  likes = 0,
  comments = 2,
  timePosted = new Date(),
  id = 0,
  currentUserId = ''
}: PostProps) {
  const [currentLikes, setCurrentLikes] = useState(likes);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(comments);
  
  // Initialize timestamp from localStorage or prop
  const [timestamp, setTimestamp] = useState(() => {
    if (!id) return ensureDate(timePosted);
    const storedTime = getStoredTimestamp(id);
    if (storedTime) return new Date(storedTime);
    
    const initialTime = ensureDate(timePosted);
    storeTimestamp(id, initialTime.toISOString());
    return initialTime;
  });

  const [displayTime, setDisplayTime] = useState(() => 
    formatTimeAgo(calculateTimeDiff(timestamp))
  );

  // Fetch comments when showComments is true
  useEffect(() => {
    if (showComments && id) {
      fetchComments();
    }
  }, [showComments, id]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/Comment/post/${id}`);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to fetch comments: ${response.status} ${text}`);
      }
      const comments = await response.json();
      if (!Array.isArray(comments)) {
        throw new Error('Comments response is not an array');
      }
      setPostComments(comments);
      setCommentCount(comments.length);
      setError(null);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setPostComments([]);
      setCommentCount(0);
      setError(error instanceof Error ? error.message : 'Failed to load comments');
    }
  };

  // Store timestamp in localStorage when it changes
  useEffect(() => {
    if (id) {
      storeTimestamp(id, timestamp.toISOString());
    }
  }, [id, timestamp]);

  // Update the display time every second
  useEffect(() => {
    const updateTime = () => {
      const diff = calculateTimeDiff(timestamp);
      setDisplayTime(formatTimeAgo(diff));
    };

    updateTime(); // Initial update
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timestamp]);

  // const handleLike = () => {
  //   setCurrentLikes(isLiked ? currentLikes - 1 : currentLikes + 1);
  //   setIsLiked(!isLiked);
  // };
  // Example: Fetch post data including likes when the component mounts
  useEffect(() => {
  const fetchPostData = async () => {
    try {
      const response = await fetch(`/api/Post/${id}`);
      if (!response.ok) throw new Error('Failed to fetch post data');
      const data = await response.json();
      setCurrentLikes(data.likes);
    } catch (error) {
      console.error('Error fetching post data:', error);
    }
  };

    if (id) fetchPostData();
  }, [id]);

  const handleLike = async () => {
    if (!currentUserId || !id) {
      setError('You must be logged in to like a post');
      return;
    }

    setIsLiked(!isLiked);
    setCurrentLikes(prev => (isLiked ? prev - 1 : prev + 1));

    try {
      const response = await fetch(`http://localhost:3001/api/Post/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUserId,
          postId: id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to like post');
      }
      const responseData = await response.json();
      setCurrentLikes(responseData.likes); // Update the likes count in the frontend
      setIsLiked(!isLiked); // Toggle the like state
    } catch (error) {
      console.error('Error liking post:', error);
      setError(error instanceof Error ? error.message : 'Failed to like post');
    }
  };


  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentText.trim() || !currentUserId || !id) {
      if (!commentText.trim()) {
        setError('Please enter a comment');
        return;
      }
      if (!currentUserId) {
        setError('You must be logged in to comment');
        return;
      }
      if (!id) {
        setError('Invalid post');
        return;
      }
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3001/api/Comment/post/` + id, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: commentText.trim(),
          posterId: currentUserId,
          postId: id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to post comment');
      }

      const newComment = await response.json();
      setPostComments(prev => [...prev, newComment]);
      setCommentCount(prev => prev + 1);
      setCommentText('');
    } catch (error) {
      console.error('Error posting comment:', error);
      setError(error instanceof Error ? error.message : 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post">
      <div className="post-header">
        <div className="post-user">
          <Link to={`/account/query?userID=${username}`} className="user-link">
            <div className="user-avatar">{username.charAt(0)}</div>
            <span className="username">{username}</span>
          </Link>
        </div>
      </div>
      
      <div className="post-image">
        <img src={imageUrl} alt="Post content" />
      </div>
      
      <div className="post-actions">
        <button 
          className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
          style={{ marginLeft: '-585px' }}
        >
        </button>
        <button 
          className="action-btn comment-btn"
          onClick={() => {
            setShowCommentForm(!showCommentForm);
            setShowComments(!showComments);
          }}
        >
        </button>
      </div>
      
      <div className="post-stats">
        <span className="likes">{currentLikes} likes</span>
        <span className="comments">{commentCount} comments</span>
      </div>
      
      <div className="post-caption">
        <span className="caption-username">{username}</span>
        <span className="caption-text"> {caption}</span>
      </div>

      <div className="post-actions-secondary">
        <button 
          className="view-comments-btn"
          onClick={() => setShowComments(!showComments)}
        >
          {showComments ? 'Hide Comments' : 'View all comments'}
        </button>
      </div>
      
      {showComments && (
        <div className="comments-section">
          {error && <div className="error-message">{error}</div>}
          <div className="comments-list">
            {postComments.map(comment => (
              <div key={comment.id} className="comment">
                <span className="comment-username">{comment.poster?.username || 'Unknown'}</span>
                <span className="comment-text">{comment.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCommentForm && (
        <div className="comment-form-section">
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="comment-input"
              disabled={isSubmitting}
            />
            <button 
              type="submit" 
              className="comment-submit"
              disabled={isSubmitting || !commentText.trim()}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>
      )}
      
      <div className="post-time">{displayTime}</div>
    </div>
  );
}
