// Chat room with real messages
import { useState, useEffect } from "react";
import { useTheme } from '../context/ThemeContext';
import { useUser } from './userData';

interface Message {
    id: number;
    content: string;
    senderId: number;
    receiverId: number;
    createdAt: string;
    sender: {
        username: string;
        pictureURL: string | null;
    };
    receiver: {
        username: string;
        pictureURL: string | null;
    };
}

interface User {
    id: number;
    username: string;
    pictureURL: string | null;
}

interface ChatRoomProps {
    userId: number;
    onChatSent?: () => void;
}

const ChatRoom = ({ userId, onChatSent }: ChatRoomProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [recipient, setRecipient] = useState<User | null>(null);
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const { currentUser } = useUser();

    // Effect to fetch recipient data based on userId prop
    useEffect(() => {
        const fetchRecipient = async () => {
            if (!userId) {
                setRecipient(null); // Clear recipient if userId changes to null/undefined
                return;
            }
            try {
                console.log('[ChatRoom] Fetching recipient with ID:', userId);
                const response = await fetch(`/api/User/${userId}`);
                if (!response.ok) {
                  throw new Error(`Failed to fetch recipient: ${response.statusText}`);
                }
                const data = await response.json();
                console.log('[ChatRoom] Received recipient data:', data);
                if (data.users && data.users.length > 0) {
                    setRecipient(data.users[0]);
                } else {
                    console.error('[ChatRoom] No recipient user found with ID:', userId);
                    setRecipient(null); // Set recipient to null if not found
                }
            } catch (error) {
                console.error('[ChatRoom] Error fetching recipient:', error);
                setRecipient(null); // Set recipient to null on error
            }
        };

        fetchRecipient();
    }, [userId]); // Depend only on userId

    // Effect to fetch messages once currentUser and recipient (with username) are available
    useEffect(() => {
        const fetchMessages = async () => {
            // Ensure we have both currentUser and recipient with their usernames
            if (!currentUser || !recipient || !currentUser.username || !recipient.username) {
                console.log('[ChatRoom] Waiting for currentUser and recipient usernames to fetch messages...');
                setMessages([]); // Clear messages if users aren't ready
                return;
            }
            
            try {
                console.log(`[ChatRoom] Fetching messages between usernames: ${currentUser.username} (${currentUser.id}) and ${recipient.username} (${recipient.id})`);
                // Use usernames in the API call
                const response = await fetch(`/api/chat/history?username1=${encodeURIComponent(currentUser.username)}&username2=${encodeURIComponent(recipient.username)}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch messages: ${response.statusText}`);
                }
                const data = await response.json();
                console.log('[ChatRoom] Received messages:', data);
                if (Array.isArray(data)) { 
                    setMessages(data);
                } else {
                    console.error('[ChatRoom] Unexpected response format for messages:', data);
                    setMessages([]); 
                }
            } catch (error) {
                console.error('[ChatRoom] Error fetching messages:', error);
                setMessages([]); 
            }
        };

        fetchMessages();
    // Depend on currentUser and recipient objects. This runs when either changes.
    // We check inside if the required usernames are present before fetching.
    }, [currentUser, recipient]); 

    const sendMessage = async () => {
        // Use recipient.id which should be available if recipient state is set
        if (!newMessage || !currentUser || !recipient) { 
            console.log('Cannot send message:', { newMessage, currentUser, recipient }); // Debug log
            return;
        }

        try {
            const response = await fetch('/api/chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: newMessage,
                    senderId: currentUser.id,
                    receiverId: recipient.id // Use recipient.id here
                }),
            });

            const sentMessage = await response.json();
            setMessages(prev => [...prev, sentMessage]);
            setNewMessage('');
            if (onChatSent) onChatSent();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    if (!currentUser) {
        return <div style={{ color: 'white', padding: '20px' }}>Please log in to chat</div>;
    }

    if (!recipient) {
        return <div style={{ color: 'white', padding: '20px' }}>Loading recipient information...</div>;
    }

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/** Chat header */}
            <div style={{ 
                display: 'flex',
                alignItems: 'center',
                marginBottom: '20px',
                borderBottom: isDarkMode ? '1px solid rgba(0, 0, 0, 0.3)' : '1px solid #ccc',
                paddingBottom: '10px',
            }}>
                <img
                    src={recipient.pictureURL || '/images/default-avatar.png'}
                    alt={recipient.username}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                />
                <h3 style={{ color: 'white' }}>{recipient.username}</h3>
            </div>
            
            {/** Messages */}
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px' }}>
                {messages.map((msg) => {
                    const isMe = msg.senderId === currentUser.id;
                    const avatar = isMe ? currentUser.pictureURL : recipient.pictureURL;

                    return (
                        <div key={msg.id} style={{
                            display: 'flex',
                            flexDirection: isMe ? 'row-reverse' : 'row',
                            alignItems: 'center',
                            marginBottom: '12px',
                        }}>
                            <img
                                src={avatar || '/images/default-avatar.png'}
                                alt="avatar"
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    margin: '0 10px',
                                }}
                            />
                            {/** Gradient chat bubble */}
                            <div style={{
                                background: isMe
                                    ? 'linear-gradient(135deg, rgb(122, 50, 124), rgb(180, 90, 200))'  // Bubble for "me"
                                    : 'linear-gradient(135deg, rgb(26, 22, 78), rgb(90, 60, 180))',    // Bubble for "them"
                                color: 'white',
                                padding: '10px 14px',
                                borderRadius: '16px',
                                borderTopLeftRadius: isMe ? '16px' : '4px',
                                borderTopRightRadius: isMe ? '4px' : '16px',
                                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                                maxWidth: '70%',
                                textAlign: 'left',
                            }}>
                                {msg.content}
                            </div>

                            {/** Timestamp */}
                            <span style={{ fontSize: '0.75rem', color: 'lightgray', marginTop: '4px' }}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/** Message input */}
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                }}
                style={{ 
                    display: 'flex', 
                    gap: '10px',
                    padding: '20px',
                    borderTop: isDarkMode ? '1px solid rgba(0, 0, 0, 0.3)' : '1px solid #ccc',
                    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'transparent'
                }}>
                <input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={{ 
                        flex: 1, 
                        padding: '10px',
                        ...(isDarkMode && {
                            backgroundColor: '#1a1a1a',
                            color: 'white',
                            border: '1px solid rgba(0, 0, 0, 0.3)'
                        })
                    }}
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default ChatRoom;