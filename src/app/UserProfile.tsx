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
                const userUrl = `/api/User/${encodeURIComponent(userID)}`;
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
                const transformedPosts = postsData.map((post: PostWithUser) => ({
                    id: post.id,
                    username: user.username,
                    imageUrl: post.pictureURL,
                    caption: post.title,
                    likes: post.likes,
                    comments: 0, // need to do something else to fetch comments properly
                    timePosted: new Date().toLocaleDateString() // Using current date as fallback
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
                        <span><strong>0</strong> Followers</span>
                        <span><strong>0</strong> Following</span>
                    </div>
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
                            currentUserId={userID}
                        />
                    ))
                )}
            </div>
        </div>
    );
}