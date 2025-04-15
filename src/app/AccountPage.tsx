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
        profilePic: "/images/profile-pic.jpg", // Default image
        posts: [
            "/images/accountPic1.png",
            "/images/accountPic2.png",
            "/images/accountPic3.png"
        ]
    });

    // Function to handle profile picture upload
    const handleProfilePicChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Creates a URL for the uploaded image to display it immediately
            const imageUrl = URL.createObjectURL(file);
            setUser({...user, profilePic: imageUrl});
            
            // Here you would typically upload the file to your server/storage
            // uploadImageToServer(file);
        }
    };

    //when database is ready
    // const uploadImageToServer = (file) => {
    //     const formData = new FormData();
    //     formData.append('profilePic', file);
    //     
    //     fetch('/api/upload-profile-pic', {
    //         method: 'POST',
    //         body: formData,
    //     })
    //     .then(response => response.json())
    //     .then(data => {
    //         console.log('Success:', data);
    //         // Update profile pic URL with the one returned from server
    //         setUser({...user, profilePic: data.imageUrl});
    //     })
    //     .catch(error => {
    //         console.error('Error:', error);
    //     });
    // };

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