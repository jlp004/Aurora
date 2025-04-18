/*page by hishita shah hrs220004*/

import React, { useState } from 'react';
import '../styles/AccountPage.css';
import Header from "../components/Header";
import "../styles/HamburgerMenu.css";

const AccountPage = () => {
    const [user, setUser] = useState({
        username: "user123!",
        bio: "Lover of code and coffee ☕",
        followers: 120,
        following: 80,
        profilePic: "/images/profile-pic.jpg", //Default image
        posts: [
            "/images/accountPic1.png",
            "/images/accountPic2.png",
            "/images/accountPic3.png"
        ]
    });

    // Profile Picture Upload
    const handleProfilePicChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setUser({ ...user, profilePic: imageUrl });
        }
    };

    // New Post Upload - Lydia
    const handleCreatePost = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setUser({...user, posts: [imageUrl, ...user.posts] }); // Add new post to the top
        }
    }

    // Delete posts
    const handleDeletePost = (indexToRemove) => {
        const updatedPosts = user.posts.filter((_, index) => index !== indexToRemove);
        setUser({ ...user, posts: updatedPosts });
    };

    return (
        <div className="account-container">
            <Header />

            <div className="profile-header">
                <div className="profile-pic-container">
                    <img src={user.profilePic} alt="Profile" className="profile-pic" />

                    {/* Image upload button */}
                    <label htmlFor="profile-pic-upload" className="upload-btn">
                        Upload Profile Photo
                    </label>
                    <input
                        id="profile-pic-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePicChange}
                        style={{ display: 'none' }}
                    />
                </div>

                <div className="user-info">
                    <h2>{user.username}</h2>
                    <p>{user.bio}</p>
                    <div className="stats">
                        <span><strong>{user.posts.length}</strong> Posts</span>
                        <span><strong>{user.followers}</strong> Followers</span>
                        <span><strong>{user.following}</strong> Following</span>
                    </div>

                    {/** Upload Post Button - Lydia */}
                    <div style={{ marginTop: '10px' }}>
                        <label htmlFor="post-upload" className="upload-btn">
                            Create New Post
                        </label>
                        <input 
                            id="post-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleCreatePost}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>
            </div>

            {/** Posts Grid */}
            <div className="image-grid">
                {user.posts.length === 0 ? (
                    <p className="no-posts-msg">You haven’t posted anything yet.</p>
                ) : (
                    user.posts.map((post, index) => (
                        <div key={index} className="post-container">
                            <img src={post} alt={`Post ${index + 1}`} className="post-img" />
                            <button className="delete-btn" onClick={() => handleDeletePost(index)}>
                                Delete
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AccountPage;
