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
  isLikedByCurrentUser?: boolean;
  profilePictureUrl?: string;
  tag?: string;
}

const getStoredTimestamp = (postId: number): string | null => {
  return localStorage.getItem(`post_${postId}_timestamp`);
};

const storeTimestamp = (postId: number, timestamp: string) => {
  localStorage.setItem(`post_${postId}_timestamp`, timestamp);
};

const ensureDate = (timestamp: string | Date): Date => {
  if (timestamp instanceof Date) return timestamp;
  // If it's a string, try to parse it as ISO string
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    console.error('Invalid date string:', timestamp);
    return new Date(); // Return current time as fallback
  }
  return date;
};

const calculateTimeDiff = (timestamp: string | Date): number => {
  const postDate = ensureDate(timestamp);
  const now = new Date();
  return Math.floor((now.getTime() - postDate.getTime()) / 1000);
};

const formatTimeAgo = (seconds: number): string => {
  if (seconds < 0) return 'just now';
  if (seconds < 60) return 'just now';
  
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (minutes < 1) {
    return 'just now';
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
  currentUserId = '',
  isLikedByCurrentUser = false,
  profilePictureUrl = '',
  tag = ''
}: PostProps) {
  const [currentLikes, setCurrentLikes] = useState(likes);
  const [isLiked, setIsLiked] = useState(isLikedByCurrentUser ?? false);
  const [showComments, setShowComments] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(comments);
  
  // Initialize timestamp directly from the prop
  const [timestamp, setTimestamp] = useState(() => {
    const date = ensureDate(timePosted);
    console.log('Initializing timestamp:', date.toISOString());
    return date;
  });

  const [displayTime, setDisplayTime] = useState(() => {
    const diff = calculateTimeDiff(timestamp);
    const formatted = formatTimeAgo(diff);
    console.log('Initial display time:', formatted);
    return formatted;
  });

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

  const handleLike = async () => {
    if (!currentUserId || !id) {
      setError('You must be logged in to like a post');
      return;
    }

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
      setCurrentLikes(responseData.likes);
      setIsLiked(responseData.isLiked);
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

  const handleDeleteComment = async (commentId: number) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        console.log('Attempting to delete post:', commentId);
        const response = await fetch(`http://localhost:3001/api/comment/${commentId}`, {
          method: 'DELETE',
        });
       
        console.log('Delete response:', response);
        const responseData = await response.json();
        console.log('Delete response data:', responseData);
       
        if (response.ok) {
          console.log('Comment deleted successfully, updating UI');
          // Only update the UI if the server deletion was successful
          setPostComments((prev) => prev.filter((comment) => comment.id !== commentId));
          setCommentCount((prev) => prev - 1);
        } else {
          console.error('Failed to delete comment:', responseData);
          throw new Error('Failed to delete comment');
        }
      } catch (err) {
        console.error('Error deleting comment:', err);
        setError('Failed to delete comment: ' + (err instanceof Error ? err.message : String(err)));
      }
    }
  };
 

  return (
    <div className="post">
      <div className="post-header">
        <div className="post-user">
          <Link to={`/account/query?userID=${username}`} className="user-link">
            <div className="post-profile-picture">
              {profilePictureUrl ? (
                <img src={profilePictureUrl} alt={`${username}'s profile`} />
              ) : (
                username.charAt(0)
              )}
            </div>
            <span className="username">{username}</span>
          </Link>
        </div>
        {tag && (
          <div className="post-tag">
            #{tag}
          </div>
        )}
      </div>
      
      <div className="post-image">
        <img src={imageUrl} alt="Post content" />
      </div>
      
      <div className="post-actions-stacked">
        <div className="post-actions">
          <button 
            className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            ♥
          </button>
          <button 
            className="action-btn comment-btn"
            onClick={() => {
              setShowCommentForm(!showCommentForm);
              setShowComments(!showComments);
            }}
          >
            💬
          </button>
        </div>
        <div className="post-stats">
          <span className="likes">{currentLikes} likes</span>
          <span className="comments">{commentCount} comments</span>
        </div>
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
                {comment.poster?.username === currentUserId && ( // Compare currentUserId with comment.poster.id
                  <button
                    className="delete-comment-btn"
                    onClick={() => handleDeleteComment(comment.id)}
              >
                Delete
              </button>
          )}
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
