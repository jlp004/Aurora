// Chat room with preloaded messages - Lydia

import { useState, useEffect } from "react";
import { users, currentUser } from '../app/userData';

interface Message {
    sender: 'me' | 'them';
    text: string;
    timestamp: string;
}

// Simulated messages between users
const messageStore: { [userId: string]: Message[] } = {
    '1': [
        { sender: 'them', text: 'Hey! How are you?', timestamp: '2:30 PM' },
        { sender: 'me', text: 'I am good! How about you?', timestamp: '2:32 PM' },
    ],
    '2': [
        { sender: 'them', text: 'You ready for the project presentation?', timestamp: '8:30 AM' },
        { sender: 'me', text: 'Almost ready! 5 more minutes', timestamp: '8:32 AM' },
    ],
    '3': [
        { sender: 'them',
             text: "Hey there! It's been a while, hope you are doing well. I'm reaching out to see if you're interested in collaborating together",
            timestamp: '3:34 PM' },
    ],
};

const ChatRoom = ({ userId }: { userId: string }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');

    // Load messages when a new user is selected
    useEffect(() => {
        setMessages(messageStore[userId] || []);
    }, [userId]);

    const sendMessage = () => {
        if (!newMessage) return;
        const now = new Date();
        const time = now.toLocaleDateString([], { hour: '2-digit', minute: '2-digit' });

        const updated: Message[] = [...messages, { sender: 'me', text: newMessage, timestamp: time, }];
        setMessages(updated);
        setNewMessage('');
    };

    const recipient = users[userId];  // User you're chatting with

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/** Chat message */}
            <div style={{ 
                display: 'flex',
                alignItems: 'center',
                marginBottom: '20px',
                borderBottom: '1px solid #ccc',
                paddingBottom: '10px',
                }}>
                    <img
                        src={recipient.avatar}
                        alt={recipient.username}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                    />
                    <h3>{recipient.username}</h3>
            </div>
            
            {/** Messages */}
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px' }}>
                {messages.map((msg, i) => {
                    const isMe = msg.sender === 'me';
                    const avatar = isMe ? currentUser.avatar: recipient.avatar;
                    const align = isMe ? 'flex-end' : 'flex-start';

                    return (
                        <div key={i} style={{
                            display: 'flex',
                            flexDirection: isMe ? 'row-reverse' : 'row',
                            alignItems: 'center',
                            marginBottom: '12px',
                        }}>
                            <img
                                src={avatar}
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
                                {msg.text}
                            </div>

                            {/** Timestamp */}
                            <span style={{ fontSize: '0.75rem', color: 'lightgray', marginTop: '4px' }}>
                                {msg.timestamp}
                            </span>
                        </div>
                    );
                })};
            </div>

            {/** Message input */}
            <form 
                onSubmit={(e) => {
                    e.preventDefault();     // Prevent page reload
                    sendMessage();
                }}
                style={{ display: 'flex', gap: '10px' }}>
                <input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={{ flex: 1, padding: '10px'}}
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default ChatRoom;