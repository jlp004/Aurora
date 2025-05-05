// userData.tsx - Lydia
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export interface User {
    id: string | number;
    username: string;
    email?: string;
    pictureURL?: string;
    avatar?: string;
    profileDesc?: string;
}

interface UserContextType {
    currentUser: User | null;
    setCurrentUser: (user: User | null) => void;
}

const defaultContextValue: UserContextType = {
    currentUser: null,
    setCurrentUser: () => {},
};

export const UserContext = createContext<UserContextType>(defaultContextValue);

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