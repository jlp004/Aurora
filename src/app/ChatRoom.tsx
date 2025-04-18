// Chat room with preloaded messages - Lydia

import { useState, useEffect } from "react";
import { users, currentUser } from '../app/userData';

interface Message {
    sender: 'me' | 'them';
    text: string;
}

// Simulated messages between users
const messageStore: { [userId: string]: Message[] } = {
    '1': [
        { sender: 'them', text: 'Hey! How are you?' },
        { sender: 'me', text: 'I am good! How about you?' },
    ],
    '2': [
        { sender: 'them', text: 'You ready for the project presentation?' },
        { sender: 'me', text: 'Almost ready! 5 more minutes' },
    ],
    '3': [
        { sender: 'them',
             text: "Hey there! It's been a while, hope you are doing well. I'm reaching out to see if you're interested in collaborating together" },
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
        const updated: Message[] = [...messages, { sender: 'me', text: newMessage }];
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
                            marginBottom: '10px',
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
                            <div style={{
                                background: isMe ? '#d1e7dd' : '#f1f1f1',
                                padding: '10px',
                                borderRadius: '10px',
                                maxWidth: '70%',
                            }}>
                                {msg.text}
                            </div>
                        </div>
                    );
                })};
            </div>

            {/** Message input */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={{ flex: 1, padding: '10px'}}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatRoom;