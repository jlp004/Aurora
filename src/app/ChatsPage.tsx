/** src/app/ChatsPage.tsx */
import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { BsMessenger } from "react-icons/bs";
import ChatRoom from "./ChatRoom";
import Header from "../components/Header";
import styles from "../styles/ChatsPage.module.css";
import { useTheme } from '../context/ThemeContext';
import { useUser as useUserData } from './userData'; // Import useUser

interface User {
  id: number;
  username: string;
  pictureURL: string | null;
}

const ChatsPage: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [recentChats, setRecentChats] = useState<User[]>([]);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const { currentUser } = useUserData(); // Use the hook

  // Fetch recent chats for sidebar
  useEffect(() => {
    if (!currentUser) return;
    const fetchRecentChats = async () => {
      try {
        const res = await fetch(`/api/chat/recent/${currentUser.id}`);
        const data = await res.json();
        setRecentChats(data.users || []);
      } catch (err) {
        console.error('Error fetching recent chats:', err);
      }
    };
    fetchRecentChats();
  }, [currentUser]);

  // Fetch users when search term changes
  useEffect(() => {
    if (!searchTerm) {
      setUsers([]);
      return;
    }
    const fetchUsers = async () => {
      try {
        const response = await fetch(`/api/chat/search-users?query=${searchTerm}`);
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [searchTerm]);

  // When a message is sent, refresh recent chats
  const handleChatSent = () => {
    if (!currentUser) return;
    fetch(`/api/chat/recent/${currentUser.id}`)
      .then(res => res.json())
      .then(data => setRecentChats(data.users || []));
  };

  return (
    <div style={containerStyle}>
      <Header />

      {/** Left panel: Search + User list */}
      <div style={{
        ...sidebarStyle,
        borderRight: isDarkMode ? '1px solid rgba(0, 0, 0, 0.3)' : '1px solid #ccc'
      }}>
        {/* ── Styled Search Bar ─────────────────────── */}
        <div className={styles.searchWrapper}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search users"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Show recent chats if searchTerm is empty, otherwise show search results */}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {(searchTerm ? users : recentChats).map(user => (
            <li
              key={user.id}
              onClick={() => setSelectedUserId(user.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px',
                cursor: 'pointer',
                borderBottom: isDarkMode ? '1px solid rgba(0, 0, 0, 0.3)' : '1px solid #eee',
                color: 'white',
              }}
            >
              <img
                src={user.pictureURL || '/images/default-avatar.png'}
                alt={user.username}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  marginRight: '10px',
                }}
              />
              <span>{user.username}</span>
            </li>
          ))}
        </ul>
      </div>

      {/** Right panel: Chat room or placeholder */}
      <div style={chatRoomStyle}>
        {selectedUserId ? (
          <ChatRoom userId={selectedUserId} onChatSent={handleChatSent} />
        ) : (
          <div style={emptyStateStyle}>
            <BsMessenger size={64} color="rgba(255,255,255,0.3)" />
            <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '20px' }}>
              Select a user to begin chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsPage;
// ——— Inline layout styles ——————————

const containerStyle: React.CSSProperties = {
  display: "flex",
  height: "calc(100vh - 64px)",
  width: "100vw",
  marginTop: "64px",
  background: "linear-gradient(135deg, rgb(26,22,78) 0%, rgb(122,50,124) 100%)",
};

const sidebarStyle: React.CSSProperties = {
  width: "30%",
  padding: "20px",
  overflow: "auto",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
};

const chatRoomStyle: React.CSSProperties = {
  width: "70%",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
};

const emptyStateStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
};

