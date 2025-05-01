/* Written by Megan Chacko - msc220005 */

import { useState } from 'react';
import '../styles/Post.css'; 

interface PostProps {
  id?: number;
  username?: string;
  imageUrl?: string;
  caption?: string;
  likes?: number;
  comments?: number;
  timePosted?: string;
  currentUserId?: string | number;
}

export default function Post({
  username = "user1234!",
  imageUrl = "../../images/mountain.jpg",
  caption = "Mountain view!",
  likes = 5,
  comments = 2,
  timePosted = "2 hours ago",
  id = 0,
  currentUserId = ''
}: PostProps) {
  const [currentLikes, setCurrentLikes] = useState(likes);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLike = () => {
    setCurrentLikes(isLiked ? currentLikes - 1 : currentLikes + 1);
    setIsLiked(!isLiked);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentText.trim() || !currentUserId || !id) {
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
      // Optionally refresh comments here
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
          ❤️
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
      
      <div className="post-time">{timePosted}</div>
    </div>
  );
}
