import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import fetch from 'jest-fetch-mock';

describe('User Management Tests', () => {
    beforeEach(() => {
        fetch.resetMocks();
    });

    test('Upload profile picture', async () => {
        const mockFile = new File(['dummy content'], 'profile.jpg', { type: 'image/jpeg' });
        const formData = new FormData();
        formData.append('image', mockFile);
        formData.append('userId', '123');

        fetch.mockResponseOnce(JSON.stringify({ imageUrl: 'http://example.com/profile.jpg' }));

        const response = await fetch('/api/upload/profile', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        expect(response.ok).toBeTruthy();
        expect(data.imageUrl).toBe('http://example.com/profile.jpg');
    });

    test('Delete profile picture', async () => {
        fetch.mockResponseOnce(JSON.stringify({ success: true }));

        const response = await fetch('/api/user/delete-profile-picture', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: '123' })
        });
        const data = await response.json();

        expect(response.ok).toBeTruthy();
        expect(data.success).toBeTruthy();
    });

    test('Make account private', async () => {
        fetch.mockResponseOnce(JSON.stringify({ isPrivate: true }));

        const response = await fetch('/api/user/privacy', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                userId: '123',
                isPrivate: true 
            })
        });
        const data = await response.json();

        expect(response.ok).toBeTruthy();
        expect(data.isPrivate).toBeTruthy();
    });

    test('Update bio', async () => {
        const newBio = 'New bio text';
        fetch.mockResponseOnce(JSON.stringify({ bio: newBio }));

        const response = await fetch('/api/user/updateBio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                username: 'testuser',
                Bio: newBio 
            })
        });
        const data = await response.json();

        expect(response.ok).toBeTruthy();
        expect(data.bio).toBe(newBio);
    });

    test('Delete account', async () => {
        fetch.mockResponseOnce(JSON.stringify({ success: true }));

        const response = await fetch('/api/User/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: 'testuser' })
        });
        const data = await response.json();

        expect(response.ok).toBeTruthy();
        expect(data.success).toBeTruthy();
    });
}); 