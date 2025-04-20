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
            {
                id: 1,
                image: "/images/accountPic1.png",
                caption: "Beautiful morning coffee",
                tags: ["Food"]
            },
            {
                id: 2,
                image: "/images/accountPic2.png",
                caption: "Nature at its best",
                tags: ["Nature"]
            },
            {
                id: 3,
                image: "/images/accountPic3.png",
                caption: "Travel diaries",
                tags: ["Travel"]
            }
        ]
    });

    // Tags
    const predefinedTags = ["Nature", "Food", "Travel", "Fashion", "Other"];
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [newPostComment, setNewPostComment] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<any>(null);

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
        }
    };

    const toggleTag = (tag: string) => {
        if (isEditModalOpen) {
            const updatedTags = editingPost.tags.includes(tag)
                ? editingPost.tags.filter(t => t !== tag)
                : [...editingPost.tags, tag];
            setEditingPost({ ...editingPost, tags: updatedTags });
        } else {
            setSelectedTags(prev => 
                prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
            );
        }
    };

    const confirmPost = () => {
        if (selectedImage) {
            const newPost = {
                id: Date.now(),
                image: selectedImage,
                caption: newPostComment,
                tags: selectedTags
            };
            setUser(prev => ({
                ...prev,
                posts: [newPost, ...prev.posts],
            }));
            closeModal();
        }
    };

    const closeModal = () => {
        setSelectedImage(null);
        setSelectedTags([]);
        setNewPostComment("");
        setIsModalOpen(false);
        setIsEditModalOpen(false);
        setEditingPost(null);
    };

    const handleEditPost = (post) => {
        setEditingPost(post);
        setIsEditModalOpen(true);
    };

    const confirmEditPost = () => {
        const updatedPosts = user.posts.map(post => 
            post.id === editingPost.id ? editingPost : post
        );
        setUser({ ...user, posts: updatedPosts });
        closeModal();
    };

    const handleDeletePost = (postId) => {
        const updatedPosts = user.posts.filter(post => post.id !== postId);
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
                    <p className="no-posts-msg">You haven't posted anything yet.</p>
                ) : (
                    user.posts.map((post) => (
                        <div key={post.id} className="post-container">
                            <img src={post.image} alt={post.caption} className="post-img" />
                            <div className="post-overlay">
                                <div className="post-info">
                                    <p className="post-caption">{post.caption}</p>
                                    <div className="post-tags">
                                        {post.tags.map((tag, idx) => (
                                            <span key={idx} className="post-tag">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="post-actions">
                                    <button className="edit-btn" onClick={() => handleEditPost(post)}>
                                        Edit
                                    </button>
                                    <button className="delete-btn" onClick={() => handleDeletePost(post.id)}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Post Modal */}
            {isModalOpen && (
                <div className='modal-overlay'>
                    <div className='modal-content'>
                        <h3>Create New Post</h3>
                        {selectedImage && (
                            <img src={selectedImage} alt="Preview" className='preview-img' />
                        )}

                        <textarea
                            placeholder='Write a caption...'
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

            {/* Edit Post Modal */}
            {isEditModalOpen && editingPost && (
                <div className='modal-overlay'>
                    <div className='modal-content'>
                        <h3>Edit Post</h3>
                        <img src={editingPost.image} alt="Preview" className='preview-img' />

                        <textarea
                            placeholder='Edit caption...'
                            value={editingPost.caption}
                            onChange={(e) => setEditingPost({ ...editingPost, caption: e.target.value })}
                            className='comment-box'
                        />

                        <div className='tag-selection'>
                            <h4>Edit Tags:</h4>
                            <div className='tags'>
                                {predefinedTags.map(tag => (
                                    <button
                                        key={tag}
                                        className={`tag-btn ${editingPost.tags.includes(tag) ? 'selected' : ''}`}
                                        onClick={() => toggleTag(tag)} 
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="confirm-btn" onClick={confirmEditPost}>Save Changes</button>
                            <button className="cancel-btn" onClick={closeModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountPage;
