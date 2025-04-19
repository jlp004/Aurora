/*page by hishita shah hrs220004*/
import { useState } from 'react';
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

    // Tags
    const predefinedTags = ["Nature", "Food", "Travel", "Fashion", "Other"];
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [newPostComment, setNewPostComment] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleProfilePicChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setUser({ ...user, profilePic: imageUrl });
        }
    };

    const handleRemoveProfilePic = () => {
        setUser({ ...user, profilePic: "" }); // Or reset to a default image
    };

    const handleCreatePost = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            setIsModalOpen(true);
            //setUser({ ...user, posts: [imageUrl, ...user.posts] });
        }
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const confirmPost = () => {
        if (selectedImage) {
            // TODO: Save the tags and comment to DB
            setUser(prev => ({
                ...prev,
                posts: [selectedImage, ...prev.posts],
            }));
            closeModal();
        }
    };

    const closeModal = () => {
        setSelectedImage(null);
        setSelectedTags([]);
        setNewPostComment("");
        setIsModalOpen(false);
    };

    const handleDeletePost = (indexToRemove) => {
        const updatedPosts = user.posts.filter((_, index) => index !== indexToRemove);
        setUser({ ...user, posts: updatedPosts });
    };

    return (
        <div className="account-container">
            <Header />

            <div className="profile-header">
                <div className="profile-pic-container" onClick={handleRemoveProfilePic}>
                    <img
                        src={user.profilePic || "/images/default-profile.jpg"}
                        alt="Profile"
                        className="profile-pic"
                    />
                    <div className="delete-text-overlay">Delete</div>

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

            {isModalOpen && (
            <div className='modal-overlay'>
                <div className='modal-content'>
                    <h3>Preview Your Post</h3>
                        {selectedImage && (
                            <img src={selectedImage} alt="Preview" className='preview-img' />
                        )}

                        <textarea
                            placeholder='Write a comment...'
                            value={newPostComment}
                            onChange={(e) => setNewPostComment(e.target.value)}
                            className='comment-box'
                        />

                        <div className='tag-selection'>
                            <h4>Select Tags:</h4>
                            <div className='tags'>
                                {predefinedTags.map(tag => (
                                    <button
                                        key={tag}
                                        className={`tag-btn ${selectedTags.includes(tag) ? 'selected' : ''}`}
                                        onClick={() => toggleTag(tag)} 
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="confirm-btn" onClick={confirmPost}>Post</button>
                            <button className="cancel-btn" onClick={closeModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountPage;
