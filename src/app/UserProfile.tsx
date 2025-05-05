// Show all post made by user - Lydia

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Post from '../components/Post';
import '../styles/UserProfile.css';
import Header from "../components/Header";
import "../styles/HamburgerMenu.css";

interface PostType {
    id: number;
    username: string;
    imageUrl: string;
    caption: string;
    likes: number;
    comments: number;
    timePosted: string;
}

interface UserType {
    id: number;
    username: string;
    email: string;
    pictureURL?: string;
    profileDesc?: string;
    followers?: number;
    following?: number;
}

interface PostWithUser {
    id: number;
    title: string;
    pictureURL: string;
    userId: number;
    likes: number;
    createdAt: string;
    user: {
        username: string;
    };
}

export default function UserProfile() {
    const [searchParams] = useSearchParams();
    const userID = searchParams.get('userID');
    const [posts, setPosts] = useState<PostType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<UserType | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [followLoading, setFollowLoading] = useState(false);

    // Get the actual logged-in user from localStorage
    const currentUser = (() => {
        const stored = localStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
    })();

    // Function to check if current user is following the profile user
    const checkFollowStatus = async (profileUserId: number) => {
        if (!currentUser || currentUser.id === profileUserId) {
            return; // Can't follow yourself
        }

        try {
            console.log('Checking follow status:', { followerId: currentUser.id, followingId: profileUserId });
            const response = await fetch('/api/isFollowing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    followerId: currentUser.id,
                    followingId: profileUserId,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Follow status check result:', data);
                setIsFollowing(data.isFollowing);
            } else {
                console.error('Failed to check follow status:', await response.text());
            }
        } catch (err) {
            console.error('Failed to check follow status:', err);
        }
    };

    // Function to handle follow/unfollow
    const handleFollowToggle = async () => {
        if (!currentUser || !user || currentUser.id === user.id) {
            return; // Can't follow yourself
        }

        setFollowLoading(true);
        
        try {
            const endpoint = isFollowing ? '/api/unfollow' : '/api/follow';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    followerId: currentUser.id,
                    followingId: user.id,
                }),
            });

            if (response.ok) {
                // Update local state for optimistic UI
                setIsFollowing(!isFollowing);
                
                // Update follower count
                if (isFollowing) {
                    setFollowerCount(prev => Math.max(0, prev - 1));
                } else {
                    setFollowerCount(prev => prev + 1);
                }
                
                // Update current user in localStorage - this keeps the following count in sync
                const updatedCurrentUser = { 
                    ...currentUser,
                    following: isFollowing 
                        ? Math.max(0, currentUser.following - 1) 
                        : (currentUser.following || 0) + 1
                };
                localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
            } else {
                const errorData = await response.json();
                console.error('Follow/unfollow error:', errorData);
            }
        } catch (err) {
            console.error('Failed to follow/unfollow:', err);
        } finally {
            setFollowLoading(false);
        }
    };

    useEffect(() => {
        if (!userID) {
            setError('No user ID provided');
            setLoading(false);
            return;
        }

        console.log('UserProfile component - userID:', userID);

        const fetchPosts = async () => {
            try {
                console.log('Fetching user data for:', userID);
                // If userID is a number, fetch by ID, else by username
                let userUrl;
                if (!isNaN(Number(userID))) {
                  userUrl = `/api/User/${encodeURIComponent(userID)}`;
                } else {
                  userUrl = `/api/User/username/${encodeURIComponent(userID)}`;
                }
                const userResponse = await fetch(userUrl);
                
                if (!userResponse.ok) {
                    throw new Error('Failed to fetch user data');
                }
                
                const userData = await userResponse.json();
                
                if (!userData.users || userData.users.length === 0) {
                    throw new Error('User not found');
                }

                const user = userData.users[0];
                setUser(user);
                setFollowerCount(user.followers || 0);
                
                // Check if current user is following this user - only once when profile loads
                if (currentUser && currentUser.id !== user.id) {
                    checkFollowStatus(user.id);
                }

                // fetch posts from this user
                const postsUrl = `/api/posts/${user.id}`;
                const postsResponse = await fetch(postsUrl);
                
                if (postsResponse.status === 404) {
                    // If no posts found, return empty array instead of error
                    setPosts([]);
                    return;
                }
                
                if (!postsResponse.ok) {
                    throw new Error('Failed to fetch posts');
                }
                
                const postsData = await postsResponse.json();
                console.log('Posts data:', postsData);
                
                if (!postsData || !Array.isArray(postsData)) {
                    setPosts([]);
                    return;
                }

                // Transform the posts data to match our PostType interface
                const transformedPosts = postsData.map((post: any) => ({
                    id: post.id,
                    username: user.username,
                    imageUrl: post.pictureURL,
                    caption: post.title,
                    likes: post.likes,
                    comments: post.comments ?? post._count?.Comment ?? 0,
                    timePosted: post.createdAt
                }));

                console.log('Transformed posts:', transformedPosts);
                setPosts(transformedPosts);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch user data');
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [userID]);

    if (loading) {
        return (
            <div className="loading-container">
                <p>Loading posts...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <Header />
                <p>{error}</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="error-container">
                <Header />
                <p>User not found</p>
            </div>
        );
    }

    // Determine if follow button should be shown
    const showFollowButton = currentUser && currentUser.id !== user.id;

    return (
        <div className="user-profile">
            <Header />
            
            <div className="profile-header">
                <div className="profile-pic-container">
                    {user.pictureURL ? (
                        <img src={user.pictureURL} alt="" className="profile-pic" />
                    ) : (
                        <div className="profile-pic">Profile</div>
                    )}
                </div>

                <div className="user-info">
                    <h2>{user.username}</h2>
                    <p>{user.profileDesc || "No bio available"}</p>
                    
                    <div className="stats">
                        <span><strong>{posts.length}</strong> Posts</span>
                        <span><strong>{followerCount}</strong> Followers</span>
                        <span><strong>{user.following || 0}</strong> Following</span>
                    </div>
                    
                    {showFollowButton && (
                        <button 
                            className={`follow-button ${isFollowing ? 'following' : ''}`}
                            onClick={handleFollowToggle}
                            disabled={followLoading}
                        >
                            {followLoading 
                                ? 'Loading...' 
                                : (isFollowing ? 'Unfollow' : 'Follow')
                            }
                        </button>
                    )}
                </div>
            </div>

            <div className="posts-grid">
                {posts.length === 0 ? (
                    <div className="no-posts-container">
                        <p>No posts found for this user.</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <Post 
                            key={post.id} 
                            {...post}
                            currentUserId={currentUser?.id}
                        />
                    ))
                )}
            </div>
        </div>
    );
}