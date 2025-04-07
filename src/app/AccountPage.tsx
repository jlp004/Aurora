//made user account page - Hishita Shah hrs220004

import React from 'react';
import '../styles/AccountPage.css';
import Header from "../components/Header";
import "../styles/HamburgerMenu.css"
const AccountPage = () => {
    //dummy user details for now, when database is ready will get data from there
    const user = {
        username: "user123!", //the username the person chose
        bio: "Lover of code and coffee ☕", //short bio
        followers: 120, //will display users followers and following 
        following: 80,
        posts: [
            //dummy images for now, when database is ready will get data from there. 
            //will be displayed in a grid format
            "/images/accountPic1.png",
            "/images/accountPic2.png",
            "/images/accountPic3.png"
        ]
    };

    return (
        //account page will display the user profile picture, bio, followers, following and posts in a grid format
        //header will be displayed on top of the page
    <div className="account-container">
        <Header />  
        
        <div className="profile-header">
            {/* Profile picture will be displayed here */}
            {/* The profile picture will be a circular image */}
            <img src="/images/profile-pic.jpg" alt="Profile" className="profile-pic" />            
            <div className="user-info">
                <h2>{user.username}</h2>
                <p>{user.bio}</p>
                <div className="stats">
                    {/* Displaying the number of posts, followers and following */}
                    {/* The numbers will be bold */}
                    {/* The text will be displayed in a row */}
                    <span><strong>{user.posts.length}</strong> Posts</span>
                    <span><strong>{user.followers}</strong> Followers</span>
                    <span><strong>{user.following}</strong> Following</span>
                </div>
            </div>
        </div>

        {/* Displaying the posts in a grid format */}
        {/* The posts will be displayed in a 3x3 grid */}
        {/* The images will be responsive */}
        <div className="image-grid">
            {user.posts.map((post, index) => (
                <img key={index} src={post} alt={`Post ${index + 1}`} className="post-img" />
            ))}
        </div>
    </div>
);

};

export default AccountPage;
