// Show all post made by user - Lydia

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Post from '../components/Post';
import '../styles/UserProfile.css';
import Header from "../components/Header";
import "../styles/HamburgerMenu.css";
import { useUser } from "./userData";

interface PostType {
    id: number;
    username: string;
    imageUrl: string;
    caption: string;
    likes: number;
    comments: number;
    timePosted: string;
    isLikedByCurrentUser?: boolean;
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
    const { currentUser } = useUser();
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    
    // Modal state for followers/following
    const [modalType, setModalType] = useState<'followers' | 'following' | null>(null);
    const [modalUsers, setModalUsers] = useState<UserType[]>([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);

    // Fetch followers or following data for the modal
    const fetchModalData = async (type: 'followers' | 'following', profileUserId: number) => {
        setModalLoading(true);
        setModalError(null);
        setModalUsers([]); // Clear previous users

        try {
            const endpoint = type === 'followers'
                ? `/api/user/${profileUserId}/followers`
                : `/api/user/${profileUserId}/following`;

            console.log(`Fetching modal data from: ${endpoint}`);
            const response = await fetch(endpoint);

            if (!response.ok) {
                throw new Error(`Failed to fetch ${type}`);
            }

            const data = await response.json();
            console.log(`Received modal data for ${type}:`, data);
            // Ensure data structure is handled correctly (assuming { users: [...] })
            const usersData = data.users || (Array.isArray(data) ? data : []);
            setModalUsers(usersData);

        } catch (err: any) {
            console.error(`Error fetching modal data for ${type}:`, err);
            setModalError(err.message || `Failed to load ${type}`);
        } finally {
            setModalLoading(false);
        }
    };

    // Open the followers/following modal
    const handleOpenModal = (type: 'followers' | 'following') => {
        if (!user?.id) return;
        const profileUserId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
        if (isNaN(profileUserId)) return;
        setModalType(type);
        setIsFollowModalOpen(true);
        fetchModalData(type, profileUserId);
    };

    // Close the modal
    const handleCloseModal = () => {
        setIsFollowModalOpen(false);
        setModalType(null);
        setModalUsers([]);
        setModalLoading(false);
        setModalError(null);
    };

    // Check if current user is following this user
    useEffect(() => {
        const checkFollowStatus = async () => {
            if (!currentUser?.id || !user?.id || currentUser.id === user.id) {
                return;
            }
            
            try {
                const response = await fetch('/api/isFollowing', {
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
                    const data = await response.json();
                    setIsFollowing(data.isFollowing);
                }
            } catch (err) {
                console.error('Error checking follow status:', err);
            }
        };
        
        checkFollowStatus();
    }, [currentUser?.id, user?.id]);

    // Handle follow/unfollow action
    const handleFollowToggle = async () => {
        if (!currentUser?.id || !user?.id) {
            alert('You need to be logged in to follow users');
            return;
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
                setIsFollowing(!isFollowing);
                
                // Refresh user data to update follower count
                if (userID) {
                    const userUrl = `/api/User/username/${encodeURIComponent(userID)}`;
                    const userResponse = await fetch(userUrl);
                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        if (userData.users && userData.users.length > 0) {
                            setUser(userData.users[0]);
                        }
                    }
                }
            } else {
                const errorData = await response.json();
                console.error('Follow/unfollow error:', errorData);
            }
        } catch (err) {
            console.error('Error with follow/unfollow action:', err);
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
                //  fetch user data to get their posts
                const userUrl = `/api/User/username/${encodeURIComponent(userID)}`;
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

                // fetch posts from this user
                const postsUrl = `/api/posts/${user.id}${currentUser?.id ? `?currentUserId=${currentUser.id}` : ''}`;
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

                // Transform the posts data to match PostType interface
                const transformedPosts = postsData.map((post: PostWithUser & { isLikedByCurrentUser?: boolean }) => ({
                    id: post.id,
                    username: user.username,
                    imageUrl: post.pictureURL,
                    caption: post.title,
                    likes: post.likes,
                    comments: 0,
                    timePosted: new Date().toLocaleDateString(),
                    profilePictureUrl: user.pictureURL,
                    isLikedByCurrentUser: post.isLikedByCurrentUser
                }));

                console.log('Transformed posts:', transformedPosts);
                setPosts(transformedPosts);
            } catch (err) {
                console.error('Error fetching posts:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch posts');
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [userID, currentUser?.id]);

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
                        <span 
                            className="stat-link" 
                            onClick={() => handleOpenModal('followers')}
                        >
                            <strong>{user.followers || 0}</strong> Followers
                        </span>
                        <span 
                            className="stat-link" 
                            onClick={() => handleOpenModal('following')}
                        >
                            <strong>{user.following || 0}</strong> Following
                        </span>
                    </div>
                    
                    {currentUser && currentUser.id !== user.id && (
                        <button 
                            className={`follow-button ${isFollowing ? 'following' : ''}`}
                            onClick={handleFollowToggle}
                            disabled={followLoading}
                        >
                            {followLoading 
                                ? 'Loading...' 
                                : isFollowing ? 'Unfollow' : 'Follow'}
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
                            profilePictureUrl={user.pictureURL}
                            isLikedByCurrentUser={post.isLikedByCurrentUser}
                        />
                    ))
                )}
            </div>

            {/* Followers/Following Modal */}
            {isFollowModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content follow-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleCloseModal}>×</button>
                        <h2>{modalType === 'followers' ? 'Followers' : 'Following'}</h2>
                        <div className="follow-list">
                            {modalLoading && <p>Loading...</p>}
                            {modalError && <p className="error-message">{modalError}</p>}
                            {!modalLoading && !modalError && modalUsers.length === 0 && (
                                <p>No users found.</p>
                            )}
                            {!modalLoading && !modalError && modalUsers.map((modalUser) => (
                                <div key={modalUser.id} className="follow-list-item">
                                    <img
                                        src={modalUser.pictureURL?.replace('/public', '') || '/images/default_avatar.png'}
                                        alt={modalUser.username}
                                        className="follow-list-pfp"
                                    />
                                    <span className="follow-list-username">{modalUser.username}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}