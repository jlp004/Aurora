/** Chats page main layout - Lydia */
import { useState } from "react";
import UserList from '../app/UserList'; // User search
import ChatRoom from '../app/ChatRoom';
import Header from '../components/Header';

const ChatsPage = () => {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    return (
        <div style={containerStyle}>
            <Header />
            {/** Left panel: User search */}
            <div style={sidebarStyle}>
                <UserList onUserSelect={setSelectedUserId} />
            </div>

            {/** Right panel: Chat room */}
            <div style={chatRoomStyle}>
                {selectedUserId ? (
                    <ChatRoom userId={selectedUserId} />
                ) : (
                    <p style={{ color: 'gray', textAlign: 'center' }}>
                        Select a user to begin chatting
                    </p>
                )}
            </div>
        </div>
    );
};

// Layout styles
const containerStyle = {
    display: 'flex',
    height: 'calc(100vh - 64px)', 
    width: '100vw',
    marginTop: '64px',  // Push content below search bar
    background: 'linear-gradient(135deg,rgb(26, 22, 78) 0%,rgb(122, 50, 124) 100%)',
};

const sidebarStyle = {
    width: '30%',
    borderRight: '1px solid #ccc',
    padding: '20px',
    overflow: 'auto',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
};

const chatRoomStyle = {
    width: '70%',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
};


export default ChatsPage;