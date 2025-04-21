// userData.tsx - Lydia
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define User interface
export interface User {
    id: string | number;
    username: string;
    email?: string;
    pictureURL?: string;
    avatar?: string;
    profileDesc?: string;
}

// Define the context type
interface UserContextType {
    currentUser: User | null;
    setCurrentUser: (user: User | null) => void;
}

// Create default context value
const defaultContextValue: UserContextType = {
    currentUser: null,
    setCurrentUser: () => {},
};

// Create the context
export const UserContext = createContext<UserContextType>(defaultContextValue);

// Create the provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize state from localStorage if available
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('currentUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Update localStorage when user changes
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }, [currentUser]);

    // Create a function to update the user
    const updateUser = (user: User | null) => {
        setCurrentUser(user);
    };

    return (
        <UserContext.Provider value={{ currentUser, setCurrentUser: updateUser }}>
            {children}
        </UserContext.Provider>
    );
};

// Create a custom hook to use the user context
export const useUser = () => useContext(UserContext);

// Sample user data for testing
export const users = {
    '1': { username: 'Jane Doe', avatar: '/images/img1.png' },
    '2': { username: 'John Smith', avatar: '/images/img2.png' },
    '3': { username: 'Lauren Anderson', avatar: '/images/img3.png' },
};

export const currentUser = {
    id: 'me',
    username: 'You',
    avatar: '/images/img4.png',
};