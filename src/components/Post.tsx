/* Written by Megan Chacko - msc220005
*
*/

import { useState, useEffect } from 'react';
import '../styles/Post.css'; 
import { formatTimeAgo } from '../utils/timeUtils';

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
  const [formattedTime, setFormattedTime] = useState('');

  // Update time display more frequently
  useEffect(() => {
    const updateTime = () => {
      setFormattedTime(formatTimeAgo(timePosted));
    };

    // Initial update
    updateTime();

    // Set up intervals for updates
    const intervals = [
      setInterval(updateTime, 1000), // Update every second for the first minute
      setInterval(updateTime, 10000), // Update every 10 seconds after the first minute
      setInterval(updateTime, 60000) // Update every minute after the first 10 minutes
    ];

    // Cleanup intervals on unmount
    return () => intervals.forEach(interval => clearInterval(interval));
  }, [timePosted]);

  const handleLike = () => {
    setCurrentLikes(isLiked ? currentLikes - 1 : currentLikes + 1);
    setIsLiked(!isLiked);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Debug log
    console.log('Submitting comment:', {
      text: commentText,
      currentUserId,
      postId: id
    });

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

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/Comment', {
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post comment');
      }

      setCommentText('');
      // You might want to refresh the comments list here
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
          <div className="user-avatar">{username.charAt(0)}</div>
          <span className="username">{username}</span>
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
        <span className="caption-text">{caption}</span>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </form>
          {error && <div className="error-message">{error}</div>}
        </div>
      )}
      
      <div className="post-time">{formattedTime}</div>
    </div>
  );
}