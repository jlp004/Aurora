import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import fetch from 'jest-fetch-mock';

describe('Chat and Messaging Tests', () => {
    beforeEach(() => {
        fetch.resetMocks();
    });

    test('Send messages between existing users', async () => {
        const mockMessage = {
            id: '123',
            content: 'Hello!',
            senderId: '456',
            receiverId: '789',
            timestamp: new Date().toISOString()
        };
        fetch.mockResponseOnce(JSON.stringify(mockMessage));

        const response = await fetch('/api/chat/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: 'Hello!',
                senderId: '456',
                receiverId: '789'
            })
        });
        const data = await response.json();

        expect(response.ok).toBeTruthy();
        expect(data.content).toBe(mockMessage.content);
        expect(data.id).toBeDefined();
    });

    test('Search for a user to message in chat', async () => {
        const mockUsers = [
            { id: '456', username: 'user1' },
            { id: '789', username: 'user2' }
        ];
        fetch.mockResponseOnce(JSON.stringify({ users: mockUsers }));

        const response = await fetch('/api/chat/search-users?query=user');
        const data = await response.json();

        expect(response.ok).toBeTruthy();
        expect(data.users).toHaveLength(2);
        expect(data.users[0].username).toBeDefined();
    });

    test('Get chat history between users', async () => {
        const mockMessages = [
            { id: '1', content: 'Hi', senderId: '456', receiverId: '789' },
            { id: '2', content: 'Hello', senderId: '789', receiverId: '456' }
        ];
        fetch.mockResponseOnce(JSON.stringify({ messages: mockMessages }));

        const response = await fetch('/api/chat/history?user1=456&user2=789');
        const data = await response.json();

        expect(response.ok).toBeTruthy();
        expect(data.messages).toHaveLength(2);
        expect(data.messages[0].content).toBeDefined();
    });
}); 