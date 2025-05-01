/** src/app/ChatsPage.tsx */
import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { BsMessenger } from "react-icons/bs";
import ChatRoom from "./ChatRoom";         // adjust path if needed
import Header from "../components/Header";
import styles from "../styles/ChatsPage.module.css";
import { useTheme } from '../context/ThemeContext';

interface User {
  id: string;
  username: string;
  avatar: string;
}

const existingUsers: User[] = [
  { id: "1", username: "Jane Doe",        avatar: "/images/img1.png" },
  { id: "2", username: "John Smith",      avatar: "/images/img2.png" },
  { id: "3", username: "Lauren Anderson", avatar: "/images/img3.png" },
];

const ChatsPage: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm]         = useState("");
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const filteredUsers = existingUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        {/* ── Inline Filtered User List ─────────────── */}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {filteredUsers.map(user => (
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
                src={user.avatar}
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
          <ChatRoom userId={selectedUserId} />
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

