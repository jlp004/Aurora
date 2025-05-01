/*page by hishita shah hrs220004*/
import { useState, useEffect } from 'react';
import '../styles/AccountPage.css';
import Header from "../components/Header";
import "../styles/HamburgerMenu.css";
import Comment from "../components/Comment";
import { useUser } from './userData';

const AccountPage = () => {
  const { currentUser } = useUser();
  
  const [user, setUser] = useState({
    id: 1,
    username: currentUser?.username || "user123",
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

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newPostComment, setNewPostComment] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [commentTab, setCommentTab] = useState<'view' | 'post'>('view');
  const [newComment, setNewComment] = useState("");

  const predefinedTags = ["Nature", "Food", "Travel", "Fashion", "Other"];

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
    document.body.classList.add('account-page-active');
    return () => {
      document.body.classList.remove('account-page-active');
    };
  }, []);

  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const imageUrl = URL.createObjectURL(file);
      setUser({ ...user, profilePic: imageUrl });
      
      try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('userId', currentUser?.id.toString() || user.id.toString());
        
        const response = await fetch('/api/upload/profile', { 
          method: 'POST', 
          body: formData 
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser({ ...user, profilePic: data.imageUrl });
        }
      } catch (err) {
        console.error('API upload error:', err);
      }
    } catch (err) {
      console.error('Failed to upload profile picture:', err);
    }
  };

  const handleRemoveProfilePic = () => {
    setUser({ ...user, profilePic: "/images/default-profile.jpg" });
  };

  const handleCreatePost = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Failed to process image:', err);
    }
  };

  const confirmPost = async () => {
    if (!selectedImage) return;
    
    try {
      const newPost = {
        id: Date.now(),
        image: selectedImage,
        caption: newPostComment,
        tags: selectedTags,
        comments: []
      };
      
      setUser(prev => ({ 
        ...prev, 
        posts: [newPost, ...prev.posts] 
      }));

      try {
        const postData = {
          userId: currentUser?.id || user.id,
          title: newPostComment,
          pictureURL: selectedImage,
          tags: selectedTags
        };
        
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData)
        });
        
        if (response.ok) {
          const data = await response.json();
          const updatedPost = { ...newPost, ...data };
          setUser(prev => ({
            ...prev,
            posts: prev.posts.map(p => p.id === newPost.id ? updatedPost : p)
          }));
        }
      } catch (err) {
        console.error('API error:', err);
      }
      
      closeModal();
    } catch (err) {
      console.error('Failed to create post:', err);
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

  const handleDeletePost = (postId: number) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setUser(prev => ({
        ...prev,
        posts: prev.posts.filter(post => post.id !== postId)
      }));
      
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
      
      <div className="profile-header">
        <div className="profile-pic-container" onClick={handleRemoveProfilePic}>
          {user.profilePic ? (
            <img src={user.profilePic} alt="" className="profile-pic" />
          ) : (
            <div className="profile-pic">Profile</div>
          )}
          <div className="profile-pic-overlay">Click to remove</div>
        </div>

        <div className="user-info">
          <h2>{user.username}</h2>
          <p>{user.bio}</p>
          
          <div className="stats">
            <span><strong>{user.posts.length}</strong> Posts</span>
            <span><strong>{user.followers}</strong> Followers</span>
            <span><strong>{user.following}</strong> Following</span>
          </div>

          <div className="action-buttons">
            <label className="upload-btn" htmlFor="profile-pic-upload">
              Upload Profile Photo
            </label>
            <input
              id="profile-pic-upload"
              type="file"
              accept="image/*"
              onChange={handleProfilePicChange}
              style={{ display: 'none' }}
            />
            
            <label className="upload-btn" htmlFor="post-upload">
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

      <div className="profile-divider" />

      <div className="image-grid">
        {user.posts.map((post) => (
          <div key={post.id} className="post-container">
            <img src={post.image} alt={post.caption} className="post-img" />
            <div className="post-hover-overlay">
              <div className="post-actions">
                <button 
                  onClick={() => setSelectedPost(post)}
                  className="post-action-btn view-btn"
                  aria-label="View post"
                >
                  View
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingPost(post);
                    setSelectedImage(post.image);
                    setNewPostComment(post.caption);
                    setSelectedTags(post.tags);
                    setIsEditModalOpen(true);
                  }}
                  className="post-action-btn edit-btn"
                  aria-label="Edit post"
                >
                  Edit
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePost(post.id);
                  }}
                  className="post-action-btn delete-btn"
                  aria-label="Delete post"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Post Creation Modal */}
      {isModalOpen && selectedImage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <h2>Create New Post</h2>
            <img src={selectedImage} alt="Preview" className="modal-preview-img" />
            <textarea
              placeholder="Write your caption..."
              value={newPostComment}
              onChange={e => setNewPostComment(e.target.value)}
              className="modal-caption"
            />
            <div className="modal-tags">
              <h3>Select Tags</h3>
              <div className="tag-buttons">
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
                    className={`tag-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={closeModal} className="modal-btn cancel">Cancel</button>
              <button onClick={confirmPost} className="modal-btn confirm">Post</button>
            </div>
          </div>
        </div>
      )}

      {/* View Post Modal */}
      {selectedPost && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <img src={selectedPost.image} alt="Post" className="modal-preview-img" />
            <p className="modal-caption">{selectedPost.caption}</p>
            <div className="modal-tags">
              {selectedPost.tags.map(tag => (
                <span key={tag} className="tag-badge">{tag}</span>
              ))}
            </div>
            <div className="comments-section">
              <div className="comment-tabs">
                <button 
                  onClick={() => setCommentTab('view')}
                  className={`tab-btn ${commentTab === 'view' ? 'active' : ''}`}
                >
                  View Comments
                </button>
                <button 
                  onClick={() => setCommentTab('post')}
                  className={`tab-btn ${commentTab === 'post' ? 'active' : ''}`}
                >
                  Add Comment
                </button>
              </div>
              {commentTab === 'view' ? (
                <div className="comments-list">
                  {selectedPost.comments?.map(comment => (
                    <Comment key={comment.id} poster={comment.poster} text={comment.text} />
                  ))}
                </div>
              ) : (
                <div className="comment-form">
                  <textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                  />
                  <button onClick={handlePostComment}>Post Comment</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {isEditModalOpen && editingPost && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <h2>Edit Post</h2>
            <img src={editingPost.image} alt="Preview" className="modal-preview-img" />
            <textarea
              placeholder="Edit caption..."
              value={newPostComment}
              onChange={e => setNewPostComment(e.target.value)}
              className="modal-caption"
            />
            <div className="modal-tags">
              <h3>Edit Tags</h3>
              <div className="tag-buttons">
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
                    className={`tag-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={closeModal} className="modal-btn cancel">Cancel</button>
              <button 
                onClick={() => {
                  const updatedPosts = user.posts.map(p => 
                    p.id === editingPost.id 
                      ? { ...p, caption: newPostComment, tags: selectedTags }
                      : p
                  );
                  setUser({ ...user, posts: updatedPosts });
                  closeModal();
                }} 
                className="modal-btn confirm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
