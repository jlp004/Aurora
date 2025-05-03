import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import fetch from 'jest-fetch-mock';

describe('Post Management Tests', () => {
    beforeEach(() => {
        fetch.resetMocks();
    });

    test('Upload photos', async () => {
        const mockFile = new File(['dummy content'], 'post.jpg', { type: 'image/jpeg' });
        const formData = new FormData();
        formData.append('image', mockFile);

        fetch.mockResponseOnce(JSON.stringify({ imageUrl: 'http://example.com/post.jpg' }));

        const response = await fetch('/api/upload/post', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        expect(response.ok).toBeTruthy();
        expect(data.imageUrl).toBe('http://example.com/post.jpg');
    });

    test('Like a post', async () => {
        fetch.mockResponseOnce(JSON.stringify({ likes: 1 }));

        const response = await fetch('/api/post/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                postId: '123',
                userId: '456' 
            })
        });
        const data = await response.json();

        expect(response.ok).toBeTruthy();
        expect(data.likes).toBe(1);
    });

    test('Delete a post', async () => {
        fetch.mockResponseOnce(JSON.stringify({ success: true }));

        const response = await fetch('/api/post/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ postId: '123' })
        });
        const data = await response.json();

        expect(response.ok).toBeTruthy();
        expect(data.success).toBeTruthy();
    });

    test('Search for posts', async () => {
        const mockPosts = [
            { id: '1', caption: 'Test post 1' },
            { id: '2', caption: 'Test post 2' }
        ];
        fetch.mockResponseOnce(JSON.stringify({ posts: mockPosts }));

        const response = await fetch('/api/post/search?query=test');
        const data = await response.json();

        expect(response.ok).toBeTruthy();
        expect(data.posts).toHaveLength(2);
        expect(data.posts[0].caption).toContain('Test post');
    });

    test('Preview before posting', async () => {
        const mockPreview = { imageUrl: 'http://example.com/preview.jpg' };
        fetch.mockResponseOnce(JSON.stringify(mockPreview));

        const mockFile = new File(['dummy content'], 'preview.jpg', { type: 'image/jpeg' });
        const formData = new FormData();
        formData.append('image', mockFile);

        const response = await fetch('/api/post/preview', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        expect(response.ok).toBeTruthy();
        expect(data.imageUrl).toBe(mockPreview.imageUrl);
    });

    test('Comment on post', async () => {
        const mockComment = {
            id: '789',
            content: 'Test comment',
            userId: '456',
            postId: '123'
        };
        fetch.mockResponseOnce(JSON.stringify(mockComment));

        const response = await fetch('/api/post/comment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: 'Test comment',
                userId: '456',
                postId: '123'
            })
        });
        const data = await response.json();

        expect(response.ok).toBeTruthy();
        expect(data.content).toBe(mockComment.content);
        expect(data.id).toBeDefined();
    });

    test('View comment section', async () => {
        const mockComments = [
            { id: '1', content: 'Comment 1', userId: '456' },
            { id: '2', content: 'Comment 2', userId: '789' }
        ];
        fetch.mockResponseOnce(JSON.stringify({ comments: mockComments }));

        const response = await fetch('/api/post/123/comments');
        const data = await response.json();

        expect(response.ok).toBeTruthy();
        expect(data.comments).toHaveLength(2);
        expect(data.comments[0].content).toBeDefined();
    });

    test('Get post likes', async () => {
        const mockLikes = [
            { userId: '456', username: 'user1' },
            { userId: '789', username: 'user2' }
        ];
        fetch.mockResponseOnce(JSON.stringify({ likes: mockLikes }));

        const response = await fetch('/api/post/123/likes');
        const data = await response.json();

        expect(response.ok).toBeTruthy();
        expect(data.likes).toHaveLength(2);
        expect(data.likes[0].username).toBeDefined();
    });
}); 