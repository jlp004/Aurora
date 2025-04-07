//made user account page - Hishita Shah

import React from 'react';
import '../styles/AccountPage.css';
import Header from "../components/Header";
import "../styles/HamburgerMenu.css"
const AccountPage = () => {
    const user = {
        username: "user123!",
        bio: "Lover of code and coffee ☕",
        followers: 120,
        following: 80,
        posts: [
            "/images/accountPic1.png",
            "/images/accountPic2.png",
            "/images/accountPic3.png"
        ]
    };

    return (
    <div className="account-container">
        <Header />  

        <div className="profile-header">
            <img src="/images/profile-pic.jpg" alt="Profile" className="profile-pic" />
            <div className="user-info">
                <h2>{user.username}</h2>
                <p>{user.bio}</p>
                <div className="stats">
                    <span><strong>{user.posts.length}</strong> Posts</span>
                    <span><strong>{user.followers}</strong> Followers</span>
                    <span><strong>{user.following}</strong> Following</span>
                </div>
            </div>
        </div>

        <div className="image-grid">
            {user.posts.map((post, index) => (
                <img key={index} src={post} alt={`Post ${index + 1}`} className="post-img" />
            ))}
        </div>
    </div>
);

};

export default AccountPage;
