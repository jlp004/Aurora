// Search and Display Users for ChatsPage - Lydia

import {useState, useEffect} from 'react';

interface User {
    id: string;
    username: string;
    avatar: string;
}

const existingUsers: User[] = [
    { id: '1', username: 'Jane Doe', avatar: '/images/img1.png' },
    { id: '2', username: 'John Smith', avatar: '/images/img2.png' },
    { id: '3', username: 'Lauren Anderson', avatar: '/images/img3.png' },
];

// Component for the search bar and list of users
const UserList = ({ onUserSelect }: { onUserSelect: (id: string) => void }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = existingUsers.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />

            <ul style={{ listStyle: 'none', padding: 0}}>
                {filteredUsers.map(user => (
                    <li
                        key={user.id}
                        onClick={() => onUserSelect(user.id)}
                        style={{
                            padding: '10px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #eee'
                        }}
                    >
                        {/** Avatar Image */}
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
        </>
    );
};

export default UserList;