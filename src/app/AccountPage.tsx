/*page by hishita shah hrs220004*/
import { useState, useEffect } from 'react';
import '../styles/AccountPage.css';
import Header from "../components/Header";
import "../styles/HamburgerMenu.css";

const AccountPage = () => {
    const [user, setUser] = useState({
        id: 1, // Assuming user ID for testing
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
    const [uploadLoading, setUploadLoading] = useState(false);
    const [error, setError] = useState("");

    const handleProfilePicChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            setUploadLoading(true);
            setError("");
            
            // Create a form data object
            const formData = new FormData();
            formData.append('image', file);
            formData.append('userId', user.id.toString());
            
            console.log('Uploading profile pic for user:', user.id);
            
            // Upload image using our API
            const response = await fetch('/api/upload/profile', {
                method: 'POST',
                body: formData,
            });
            
            // Check response type before parsing JSON
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                // Get the text to see what's being returned
                const text = await response.text();
                console.error("Non-JSON response:", text);
                throw new Error("Server didn't return JSON. Check server logs.");
            }
            
            const data = await response.json();
            console.log('Profile upload response:', data);
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to upload profile picture');
            }
            
            // Update user state with new profile picture URL
            setUser({ ...user, profilePic: data.imageUrl });
        } catch (err) {
            console.error('Error uploading profile picture:', err);
            setError(err.message || 'Failed to upload profile picture');
        } finally {
            setUploadLoading(false);
        }
    };

    const handleRemoveProfilePic = () => {
        setUser({ ...user, profilePic: "/images/default-profile.jpg" }); // Reset to default
    };

    const handleCreatePost = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            setUploadLoading(true);
            setError("");
            
            // Create a form data object
            const formData = new FormData();
            formData.append('image', file);
            
            // Upload image using our API
            const response = await fetch('/api/upload/post', {
                method: 'POST',
                body: formData,
            });
            
            // Check response type before parsing JSON
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                // Get the text to see what's being returned
                const text = await response.text();
                console.error("Non-JSON response:", text);
                throw new Error("Server didn't return JSON. Check server logs.");
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to upload image');
            }
            
            // Set the selected image and open the modal
            setSelectedImage(data.imageUrl);
            setIsModalOpen(true);
        } catch (err) {
            console.error('Error uploading image:', err);
            setError(err.message || 'Failed to upload image');
        } finally {
            setUploadLoading(false);
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

    const confirmPost = async () => {
        if (selectedImage) {
            try {
                // Create post data matching the schema
                const postData = {
                    userId: user.id,
                    title: newPostComment,
                    pictureURL: selectedImage,
                    // Tags are handled differently in the schema so we'll omit for now
                };
                
                console.log('Sending post data:', postData);
                
                // Save post to database through API
                const response = await fetch('/api/posts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(postData)
                });
                
                // Check response type before parsing JSON
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    // Get the text to see what's being returned
                    const text = await response.text();
                    console.error("Non-JSON response:", text);
                    throw new Error("Server didn't return JSON. Check server logs.");
                }
                
                const data = await response.json();
                console.log('Response data:', data);
                
                if (!response.ok) {
                    if (data.details) {
                        console.error('Server error details:', data.details);
                        throw new Error(`${data.message}: ${data.details}`);
                    }
                    throw new Error(data.message || data.error || 'Failed to create post');
                }
                
                // Add post to local state
                const newPost = {
                    id: data.id || Date.now(),
                    image: selectedImage,
                    caption: newPostComment,
                    tags: selectedTags
                };
                
                setUser(prev => ({
                    ...prev,
                    posts: [newPost, ...prev.posts],
                }));
                
                closeModal();
            } catch (err) {
                console.error('Error creating post:', err);
                setError(err.message || 'Failed to create post');
            }
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

            {error && <div className="error-message">{error}</div>}
            {uploadLoading && <div className="loading-indicator">Uploading...</div>}

            <div className="profile-header">
                <div className="profile-pic-container" onClick={!uploadLoading ? handleRemoveProfilePic : undefined}>
                    <img
                        src={user.profilePic || "/images/default-profile.jpg"}
                        alt="Profile"
                        className="profile-pic"
                    />
                    <div className="delete-text-overlay">Delete</div>

                    <label htmlFor="profile-pic-upload" className={`upload-btn ${uploadLoading ? 'disabled' : ''}`}>
                        {uploadLoading ? 'Uploading...' : 'Upload Profile Photo'}
                    </label>
                    <input
                        id="profile-pic-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePicChange}
                        style={{ display: 'none' }}
                        disabled={uploadLoading}
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
                        <label htmlFor="post-upload" className={`upload-btn ${uploadLoading ? 'disabled' : ''}`}>
                            {uploadLoading ? 'Uploading...' : 'Create New Post'}
                        </label>
                        <input
                            id="post-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleCreatePost}
                            style={{ display: 'none' }}
                            disabled={uploadLoading}
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
