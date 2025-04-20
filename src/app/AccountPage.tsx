/*page by hishita shah hrs220004*/
import { useState, useEffect } from 'react';
import '../styles/AccountPage.css';
import Header from "../components/Header";
import "../styles/HamburgerMenu.css";
import Comment from "../components/Comment";

const AccountPage = () => {
  const [user, setUser] = useState({
    id: 1,
    username: "user123!",
    bio: "Lover of code and coffee ☕",
    followers: 120,
    following: 80,
    profilePic: "/images/profile-pic.jpg",
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
      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', user.id.toString());
      const response = await fetch('/api/upload/profile', { method: 'POST', body: formData });
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) throw new Error(await response.text());
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to upload profile picture');
      setUser({ ...user, profilePic: data.imageUrl });
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
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch('/api/upload/post', { method: 'POST', body: formData });
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) throw new Error(await response.text());
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to upload image');
      setSelectedImage(data.imageUrl);
      setIsModalOpen(true);
    } catch (err) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploadLoading(false);
    }
  };

  const confirmPost = async () => {
    if (!selectedImage) return;
    try {
      const postData = {
        userId: user.id,
        title: newPostComment,
        pictureURL: selectedImage
      };
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) throw new Error(await response.text());
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Failed to create post');
      const newPost = {
        id: data.id || Date.now(),
        image: selectedImage,
        caption: newPostComment,
        tags: selectedTags,
        comments: []
      };
      setUser(prev => ({ ...prev, posts: [newPost, ...prev.posts] }));
      closeModal();
    } catch (err) {
      setError(err.message || 'Failed to create post');
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
          comments: [...(post.comments || []), { id: Date.now(), poster: user.username, text: newComment }]
        } : post
    );
    setUser({ ...user, posts: updatedPosts });
    setSelectedPost(updatedPosts.find(p => p.id === selectedPost.id));
    setNewComment("");
    setCommentTab('view');
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
            <div key={post.id} className="post-container" onClick={() => setSelectedPost(post)}>
              <img src={post.image} alt={post.caption} className="post-img" />
            </div>
          ))
        )}
      </div>

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
