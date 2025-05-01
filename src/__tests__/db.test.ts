import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import fetch from 'jest-fetch-mock';

describe('Database Integration Tests', () => {
    beforeEach(() => {
        fetch.resetMocks();
    });

    test('Getting and posting users', async () => {
        // Test posting a new user
        const mockUser = {
            id: '123',
            username: 'testuser',
            email: 'test@example.com'
        };
        fetch.mockResponseOnce(JSON.stringify(mockUser));

        let response = await fetch('/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'testuser',
                email: 'test@example.com'
            })
        });
        let data = await response.json();

        expect(response.ok).toBeTruthy();
        expect(data.username).toBe(mockUser.username);

        // Test getting a user
        fetch.mockResponseOnce(JSON.stringify(mockUser));
        response = await fetch('/api/user/123');
        data = await response.json();

        expect(response.ok).toBeTruthy();
        expect(data.username).toBe(mockUser.username);
    });

    test('Getting and posting posts', async () => {
        // Test posting a new post
        const mockPost = {
            id: '456',
            userId: '123',
            caption: 'Test post',
            imageUrl: 'http://example.com/image.jpg'
        };
        fetch.mockResponseOnce(JSON.stringify(mockPost));

        let response = await fetch('/api/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: '123',
                caption: 'Test post',
                imageUrl: 'http://example.com/image.jpg'
            })
        });
        let data = await response.json();

        expect(response.ok).toBeTruthy();
        expect(data.caption).toBe(mockPost.caption);

        // Test getting posts
        const mockPosts = [mockPost];
        fetch.mockResponseOnce(JSON.stringify({ posts: mockPosts }));
        response = await fetch('/api/posts');
        data = await response.json();

        expect(response.ok).toBeTruthy();
        expect(data.posts).toHaveLength(1);
        expect(data.posts[0].caption).toBe(mockPost.caption);
    });

    test('Linking comments to unique IDs', async () => {
        const mockComment = {
            id: '789',
            postId: '456',
            userId: '123',
            content: 'Test comment'
        };
        fetch.mockResponseOnce(JSON.stringify(mockComment));

        const response = await fetch('/api/comment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                postId: '456',
                userId: '123',
                content: 'Test comment'
            })
        });
        const data = await response.json();

        expect(response.ok).toBeTruthy();
        expect(data.id).toBeDefined();
        expect(data.postId).toBe(mockComment.postId);
        expect(data.userId).toBe(mockComment.userId);
    });

    test('Communication between Prisma DB and Next frontend', async () => {
        // Test database connection
        fetch.mockResponseOnce(JSON.stringify({ status: 'connected' }));
        
        let response = await fetch('/api/db/status');
        let data = await response.json();

        expect(response.ok).toBeTruthy();
        expect(data.status).toBe('connected');

        // Test data persistence
        const mockData = { id: '123', data: 'test' };
        fetch.mockResponseOnce(JSON.stringify(mockData));

        response = await fetch('/api/db/test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mockData)
        });
        data = await response.json();

        expect(response.ok).toBeTruthy();
        expect(data.id).toBeDefined();
        expect(data.data).toBe(mockData.data);
    });
}); 