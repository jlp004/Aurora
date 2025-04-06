import { useState } from 'react';
import '../styles/Post.css'; 

interface PostProps {
  username?: string;
  imageUrl?: string;
  caption?: string;
  likes?: number;
  comments?: number;
  timePosted?: string;
}

export default function Post({
  username = "user1234!",
  imageUrl = "../../images/mountain.jpg",
  caption = "Mountain view!",
  likes = 5,
  comments = 2,
  timePosted = "2 hours ago"
}: PostProps) {
  const [currentLikes, setCurrentLikes] = useState(likes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setCurrentLikes(isLiked ? currentLikes - 1 : currentLikes + 1);
    setIsLiked(!isLiked);
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
        <button className="action-btn comment-btn">💬</button>
      </div>
      
      <div className="post-stats">
        <span className="likes">{currentLikes} likes</span>
        <span className="comments">{comments} comments</span>
      </div>
      
      <div className="post-caption">
        <span className="caption-username">{username}</span>
        <span className="caption-text">{caption}</span>
      </div>
      
      <div className="post-time">{timePosted}</div>
    </div>
  );
}