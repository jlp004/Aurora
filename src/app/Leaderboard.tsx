/*by hishita*/
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import '../styles/Leaderboard.css';

interface User {
  id: number;
  username: string;
  pictureURL?: string;
  followers: number;
  likes: number;
}

const Leaderboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [sortBy, setSortBy] = useState<'likes' | 'followers'>('likes');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/User');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const sortedUsers = [...users].sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div className="leaderboard-container">
      <Header />
      <div className="leaderboard-content">
        <h1 className="leaderboard-title">Aurora Leaderboard</h1>
        
        <div className="sort-controls">
          <button 
            className={`sort-button ${sortBy === 'likes' ? 'active' : ''}`}
            onClick={() => setSortBy('likes')}
          >
            Sort by Likes
          </button>
          <button 
            className={`sort-button ${sortBy === 'followers' ? 'active' : ''}`}
            onClick={() => setSortBy('followers')}
          >
            Sort by Followers
          </button>
        </div>

        <div className="leaderboard-list">
          {sortedUsers.slice(0, 10).map((user, index) => (
            <div key={user.id} className="leaderboard-item">
              <div className="rank">{index + 1}</div>
              <div className="lb-user-info">
                <img 
                  src={user.pictureURL || '/images/default-avatar.png'} 
                  alt={user.username}
                  className="lb-user-avatar"
                />
                <span className="lb-username">{user.username}</span>
              </div>
              <div className="lb-stats">
                <div className="lb-stat">
                  <span className="lb-stat-value">
                    {sortBy === 'likes' ? user.likes : user.followers}
                  </span>
                  <span className="lb-stat-label">
                    {sortBy === 'likes' ? 'Likes' : 'Followers'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Leaderboard; 