/*page by hishita shah hrs220004*/
import { useState, useEffect } from 'react';
import '../styles/AccountPage.css';
import Header from "../components/Header";
import "../styles/HamburgerMenu.css";
import Comment from "../components/Comment";
import { useUser } from './userData';

const AccountPage = () => {
  // Get the current user from context
  const { currentUser } = useUser();
  
  const [user, setUser] = useState({
    id: 1,
    username: currentUser?.username || "user123!",
    bio: "Lover of code and coffee ☕",
    followers: 120,
    following: 80,
    profilePic: currentUser?.pictureURL || "/images/profile-pic.jpg",
    posts: [
      {
        id: 1,
        image: "/images/accountPic1.png",
        caption: "Beautiful morning coffee",
        tags: ["Food"],
        comments: [
          { id: 1, poster: "User1", text: "Beautiful shot! Love the colors 😍" },
          { id: 2, poster: "User2", text: "wow, where was this taken??" }
        ]
      },
      {
        id: 2,
        image: "/images/accountPic2.png",
        caption: "Nature at its best",
        tags: ["Nature"],
        comments: []
      },
      {
        id: 3,
        image: "/images/accountPic3.png",
        caption: "Travel diaries",
        tags: ["Travel"],
        comments: []
      }
    ]
  });

  useEffect(() => {
    if (currentUser) {
      setUser(prev => ({
        ...prev,
        id: typeof currentUser.id === 'string' ? parseInt(currentUser.id, 10) || 1 : currentUser.id,
        username: currentUser.username,
        profilePic: currentUser.pictureURL || prev.profilePic,
        bio: currentUser.profileDesc || prev.bio
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    // Add the class to body when component mounts
    document.body.classList.add('account-page-active');
    
    // Remove the class when component unmounts
    return () => {
      document.body.classList.remove('account-page-active');
    };
  }, []);

  const predefinedTags = ["Nature", "Food", "Travel", "Fashion", "Other"];
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newPostComment, setNewPostComment] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [commentTab, setCommentTab] = useState<'view' | 'post'>('view');
  const [newComment, setNewComment] = useState<string>("");

  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      setUploadLoading(true);
      setError("");
      
      // Create a URL for the selected file (for offline support)
      const imageUrl = URL.createObjectURL(file);
      
      try {
        // Try to upload to API if available
        const formData = new FormData();
        formData.append('image', file);
        formData.append('userId', currentUser?.id.toString() || user.id.toString());
        
        const response = await fetch('/api/upload/profile', { method: 'POST', body: formData });
        
        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            const data = await response.json();
            // If API returns a URL, use it instead of local URL
            setUser({ ...user, profilePic: data.imageUrl });
            return;
          }
        }
      } catch (err) {
        console.error('API upload error:', err);
        // Continue with local URL
      }
      
      // Use the local URL if API call fails
      setUser({ ...user, profilePic: imageUrl });
    } catch (err) {
      setError(err.message || 'Failed to upload profile picture');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleRemoveProfilePic = () => {
    setUser({ ...user, profilePic: "/images/default-profile.jpg" });
  };

  const handleCreatePost = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      setUploadLoading(true);
      setError("");
      
     
      let imageUrl = "";
      
      try {
        const formData = new FormData();
        formData.append('image', file);
        const response = await fetch('/api/upload/post', { method: 'POST', body: formData });
        
        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            const data = await response.json();
            imageUrl = data.imageUrl;
          }
        }
      } catch (err) {
        console.error('API upload error:', err);
      }
      
      if (!imageUrl) {
        imageUrl = URL.createObjectURL(file);
      }
      
      setSelectedImage(imageUrl);
      setIsModalOpen(true);
    } catch (err) {
      setError('Failed to process image: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUploadLoading(false);
    }
  };

  const confirmPost = async () => {
    if (!selectedImage) return;
    
    try {
      setUploadLoading(true);
      
      let newPostId = Date.now();
      let newPostData = null;
      
      try {
        // Attempt the API call, but don't require it to succeed
        const postData = {
          userId: currentUser?.id || user.id,
          title: newPostComment,
          pictureURL: selectedImage
        };
        
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData)
        });
        
        // If API call succeeds, use the returned data
        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            const data = await response.json();
            newPostId = data.id || newPostId;
            newPostData = data;
          }
        }
      } catch (err) {
        console.error('API error:', err);
      }
      
      // Create a new post with the data
      const newPost = {
        id: newPostId,
        image: selectedImage,
        caption: newPostComment,
        tags: selectedTags,
        comments: [],
        userId: currentUser?.id || user.id
      };
      
      // Add the new post to the user's posts
      setUser(prev => ({ ...prev, posts: [newPost, ...prev.posts] }));
      closeModal();
    } catch (err) {
      setError('Failed to create post: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUploadLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedImage(null);
    setSelectedTags([]);
    setNewPostComment("");
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    setEditingPost(null);
    setSelectedPost(null);
    setNewComment("");
    setCommentTab('view');
  };

  const handlePostComment = () => {
    if (!newComment.trim()) return;
    const updatedPosts = user.posts.map(post =>
      post.id === selectedPost.id
        ? {
          ...post,
          comments: [...(post.comments || []), { 
            id: Date.now(), 
            poster: currentUser?.username || user.username, 
            text: newComment 
          }]
        } : post
    );
    setUser({ ...user, posts: updatedPosts });
    setSelectedPost(updatedPosts.find(p => p.id === selectedPost.id));
    setNewComment("");
    setCommentTab('view');
  };

  // Add a function to handle post deletion
  const handleDeletePost = (postId: number) => {
    // Confirm before deleting
    if (window.confirm('Are you sure you want to delete this post?')) {
      // Filter out the post with the matching ID
      const updatedPosts = user.posts.filter(post => post.id !== postId);
      setUser({ ...user, posts: updatedPosts });
      
      // Try to send delete request to backend if available
      try {
        fetch(`/api/posts/${postId}`, {
          method: 'DELETE',
        }).catch(err => console.error('API error:', err));
      } catch (err) {
        console.error('Error deleting post:', err);
      }
    }
  };

  return (
    <div className="account-container">
      <Header />

      {error && <div className="error-message">{error}</div>}
      {uploadLoading && <div className="loading-indicator">Uploading...</div>}

      <div className="profile-header">
        <div className="profile-pic-container" onClick={!uploadLoading ? handleRemoveProfilePic : undefined}>
          <img src={user.profilePic || "/images/default-profile.jpg"} alt="Profile" className="profile-pic" />
          <div className="delete-text-overlay">Delete</div>
          <label htmlFor="profile-pic-upload" className={`upload-btn ${uploadLoading ? 'disabled' : ''}`}>
            {uploadLoading ? 'Uploading...' : 'Upload Profile Photo'}
          </label>
          <input id="profile-pic-upload" type="file" accept="image/png, image/jpeg, image/jpg, image/gif" onChange={handleProfilePicChange} style={{ display: 'none' }} disabled={uploadLoading} />
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
            <label htmlFor="post-upload" className={`upload-btn ${uploadLoading ? 'disabled' : ''}`}>{uploadLoading ? 'Uploading...' : 'Create New Post'}</label>
            <input id="post-upload" type="file" accept="image/png, image/jpeg, image/jpg, image/gif" onChange={handleCreatePost} style={{ display: 'none' }} disabled={uploadLoading} />
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
              
              {/* Delete button overlay */}
              <div className="post-hover-overlay">
                <div className="post-hover-actions">
                  <button 
                    className="post-delete-btn" 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent opening the post
                      handleDeletePost(post.id);
                    }}
                    aria-label="Delete post"
                  >
                    <span className="delete-icon">×</span>
                  </button>
                </div>
                
                <div className="post-view-container">
                  <button 
                    className="post-view-btn"
                    onClick={() => setSelectedPost(post)}
                    aria-label="View post"
                  >
                    View Post
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post Creation Modal */}
      {isModalOpen && selectedImage && (
        <div className="modal-overlay" onClick={closeModal} style={{ backgroundColor: 'rgba(168, 85, 247, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="expanded-post-modal" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginTop: '50px', width: '600px', maxWidth: '90%', boxSizing: 'border-box', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>Create New Post</h2>
            <div className="post-preview">
              <img src={selectedImage} alt="Post preview" className="preview-img" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} />
            </div>
            <div className="post-form" style={{ marginTop: '20px' }}>
              <textarea 
                placeholder="Write your caption here..." 
                value={newPostComment} 
                onChange={(e) => setNewPostComment(e.target.value)}
                style={{ width: '100%', padding: '10px', minHeight: '100px', borderRadius: '6px', marginBottom: '15px' }}
              />
              
              <div className="tag-selection" style={{ marginBottom: '15px' }}>
                <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>Tags:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {predefinedTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          setSelectedTags(selectedTags.filter(t => t !== tag));
                        } else {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        background: selectedTags.includes(tag) ? '#a855f7' : '#f3f4f6',
                        color: selectedTags.includes(tag) ? 'white' : 'black',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  onClick={closeModal}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmPost}
                  style={{ padding: '8px 16px', borderRadius: '6px', background: '#a855f7', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Post Modal */}
      {selectedPost && (
        <div className="modal-overlay" onClick={closeModal} style={{ backgroundColor: 'rgba(168, 85, 247, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="expanded-post-modal" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginTop: '50px', width: '600px', maxWidth: '90%', boxSizing: 'border-box', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>Comments</h2>
            <div className="post-preview">
              <img src={selectedPost.image} alt="Post preview" className="preview-img" />
            </div>
            <div className="comment-box">
              <div className="tab-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
                <button onClick={() => setCommentTab('view')} className={commentTab === 'view' ? 'active' : ''} style={{ backgroundColor: '#a855f7', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>View Comments</button>
                <button onClick={() => setCommentTab('post')} className={commentTab === 'post' ? 'active' : ''} style={{ backgroundColor: '#a855f7', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Post a Comment</button>
              </div>
              {commentTab === 'view' ? (
                <div className="comments-list">
                  {selectedPost.comments?.length === 0 ? (
                    <p>No comments yet.</p>
                  ) : (
                    selectedPost.comments.map(comment => (
                      <Comment key={comment.id} poster={comment.poster} text={comment.text} />
                    ))
                  )}
                </div>
              ) : (
                <div className="post-comment-form" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', padding: '16px', borderRadius: '8px' }}> 
                  <textarea placeholder="Write your comment here..." style={{ color: 'black' }} value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                  <button onClick={handlePostComment} style={{ backgroundColor: '#a855f7', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' }}>Post comment →</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
