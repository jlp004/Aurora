// Show all post made by user - Lydia

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Post from '../components/Post';

interface PostType {
    id: number;
    username: string;
    imageUrl: string;
    caption: string;
    likes: number;
    comments: number;
    timePosted: string;
}

export default function UserProfile() {
    const [SearchParams] = useSearchParams();
    const userID = SearchParams.get('userID');
    const [posts, setPosts] = useState<PostType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userID) return;

        const fetchPost = async () => {
            try {
                const response = await fetch('/api/posts?userID=${userID}');
                const data = await response.json();
                setPosts(data);
            } catch (err) {
                console.error('Error fetching posts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [userID]);

    if (loading) return <p>Loading posts...</p>;
    if (!posts.length) return <p>No posts found for this user.</p>;

    return (
        <div className="user-profile">
            <h2>{userID} </h2>
            {posts.map(post => (
                <Post key={post.id} {...post} />
            ))}
        </div>
    );
}