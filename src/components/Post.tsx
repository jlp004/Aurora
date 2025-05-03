/* Written by Megan Chacko - msc220005 */

import { useState, useEffect } from 'react';
import '../styles/Post.css'; 
import { Link } from 'react-router-dom';

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
  likes = 5,
  comments = 2,
  timePosted = new Date(),
  id = 0,
  currentUserId = ''
}: PostProps) {
  const [currentLikes, setCurrentLikes] = useState(likes);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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

  const handleLike = () => {
    setCurrentLikes(isLiked ? currentLikes - 1 : currentLikes + 1);
    setIsLiked(!isLiked);
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
      const response = await fetch('/api/Comment/post/' + id, {
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
        >
        </button>
        <button 
          className="action-btn comment-btn"
          onClick={() => setShowComments(!showComments)}
        >
          💬
        </button>
      </div>
      
      <div className="post-stats">
        <span className="likes">{currentLikes} likes</span>
        <span className="comments">{comments} comments</span>
      </div>
      
      <div className="post-caption">
        <span className="caption-username">{username}</span>
        <span className="caption-text"> {caption}</span>
      </div>
      
      {showComments && (
        <div className="comments-section">
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
          {error && <div className="error-message">{error}</div>}
        </div>
      )}
      
      <div className="post-time">{displayTime}</div>
    </div>
  );
}
