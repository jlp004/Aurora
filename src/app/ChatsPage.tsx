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
    height: '100 vh',
    width: '100vw',
};

const sidebarStyle = {
    width: '30%',
    borderRight: '1px solid #ccc',
    padding: '20px',
    overflowY: 'auto',
};

const chatRoomStyle = {
    width: '70%',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
};

export default ChatsPage;