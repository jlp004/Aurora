/*page by hishita shah hrs220004*/
import { useState, useEffect } from 'react';
import '../styles/AccountPage.css';
import Header from "../components/Header";
import "../styles/HamburgerMenu.css";
import Comment from "../components/Comment";
import { useUser } from './userData';
import { FaUser } from 'react-icons/fa';

const AccountPage = () => {
  const { currentUser, setCurrentUser } = useUser();
  
  const [user, setUser] = useState({
    id: currentUser?.id || 1,
    username: currentUser?.username || "user123",
    bio: currentUser?.profileDesc || "Lover of code and coffee ☕",
    followers: 0,
    following: 0,
    profilePic: currentUser?.pictureURL || "/images/default_avatar.png",
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
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<any[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const predefinedTags = ["Nature", "Food", "Travel", "Fashion", "Sports"];

  useEffect(() => {
    if (currentUser) {
      setUser(prev => ({
        ...prev,
        id: typeof currentUser.id === 'string' ? parseInt(currentUser.id, 10) || 1 : currentUser.id,
        username: currentUser.username || prev.username,
        profilePic: currentUser.pictureURL || prev.profilePic,
        bio: currentUser.profileDesc || prev.bio
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.id) {
        try {
          console.log('Fetching user data for ID:', currentUser.id);
          const response = await fetch(`http://localhost:3001/api/user/${currentUser.id}`);
          if (response.ok) {
            const responseData = await response.json();
            console.log('Full API response:', responseData);
            
            // Check if data is nested under a 'users' array or another property
            let userData;
            if (responseData.users && responseData.users.length > 0) {
              userData = responseData.users[0]; // Get first user from users array
              console.log('Found user in responseData.users[0]:', userData);
            } else if (responseData.user) {
              userData = responseData.user; // Get user from user property
              console.log('Found user in responseData.user:', userData);
            } else {
              userData = responseData; // Direct response is the user data
              console.log('Assuming responseData is the user:', userData);
            }
            
            console.log('Followers from userData:', userData.followers);
            console.log('Following from userData:', userData.following);
            
            setUser(prev => {
              const newState = {
                ...prev,
                id: userData.id,
                username: userData.username || prev.username,
                profilePic: userData.pictureURL || prev.profilePic,
                bio: userData.profileDesc || prev.bio,
                followers: userData.followers ?? 0,
                following: userData.following ?? 0
              };
              console.log('Updated user state:', newState);
              return newState;
            });
          } else {
            console.error('Failed to fetch user data:', response.status);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      }
    };

    fetchUserData();
  }, [currentUser?.id]);

  useEffect(() => {
    document.body.classList.add('account-page-active');
    return () => {
      document.body.classList.remove('account-page-active');
    };
  }, []);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!currentUser) return;
      
      try {
        console.log('Fetching posts for user ID:', currentUser.id);
        const response = await fetch(`http://localhost:3001/api/posts/${currentUser.id}`);
        console.log('API Response:', response);
        if (response.ok) {
          const posts = await response.json();
          console.log('Received posts:', posts);
          const formattedPosts = posts.map((post: any) => ({
            id: post.id,
            image: post.pictureURL,
            caption: post.title,
            tags: post.tags || [],
            comments: []
          }));
          console.log('Formatted posts:', formattedPosts);
          setUser(prev => ({ ...prev, posts: formattedPosts }));
        } else {
          console.error('Failed to fetch posts:', response.status, response.statusText);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
      }
    };

    fetchUserPosts();
  }, [currentUser]);

  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      // Show preview immediately
      const previewUrl = URL.createObjectURL(file);
      setUser(prev => ({ ...prev, profilePic: previewUrl }));
      
      // Upload to server
      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', currentUser?.id.toString() || user.id.toString());
      
      const response = await fetch('http://localhost:3001/api/upload/profile', { 
        method: 'POST', 
        body: formData 
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Profile picture uploaded:', data);
        
        // Update both local state and user context with the new image URL
        // Remove the /public prefix from the image URL
        const newImageUrl = data.imageUrl.replace('/public', '');
        
        // Update user context first
        if (currentUser) {
          const updatedUser = { ...currentUser, pictureURL: newImageUrl };
          setCurrentUser(updatedUser);
        }
        
        // Update local state
        setUser(prev => ({ 
          ...prev, 
          profilePic: newImageUrl,
          username: prev.username
        }));
        
        // Force an immediate update of the image
        const imgElement = document.querySelector('.profile-pic') as HTMLImageElement;
        if (imgElement) {
          // Create a new image object to preload
          const newImage = new Image();
          newImage.src = newImageUrl;
          
          // Update the DOM immediately
          imgElement.src = newImageUrl;
          
          // Force a re-render after a short delay
          setTimeout(() => {
            imgElement.src = '';
            imgElement.src = newImageUrl;
          }, 100);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to upload profile picture:', errorData);
        throw new Error('Failed to upload profile picture');
      }
    } catch (err) {
      console.error('Failed to upload profile picture:', err);
      setError('Failed to upload profile picture: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleRemoveProfilePic = () => {
    setUser({ ...user, profilePic: "" });
    if (currentUser) {
      setCurrentUser({ ...currentUser, pictureURL: "" });
    }
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

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      if (!data.imageUrl) {
        throw new Error('No image URL returned from server');
      }

      setSelectedImage(data.imageUrl);
      setIsModalOpen(true);
    } catch (err) {
      console.error('API upload error:', err);
      setError('Failed to process image: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUploadLoading(false);
    }
  };


  const confirmPost = async () => {
    if (!selectedImage) return;
    
    try {
      console.log('Creating post with data:', {
        userId: currentUser?.id || user.id,
        title: newPostComment,
        pictureURL: selectedImage,
        tag: selectedTags[0] || ''
      });

      const postData = {
        userId: currentUser?.id || user.id,
        title: newPostComment,
        pictureURL: selectedImage,
        tag: selectedTags[0] || ''
      };
      
      const response = await fetch('http://localhost:3001/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      
      console.log('Create post response:', response);
      
      if (response.ok) {
        const newPost = await response.json();
        console.log('Created post:', newPost);
        setUser(prev => ({ 
          ...prev, 
          posts: [{
            id: newPost.id,
            image: newPost.pictureURL,
            caption: newPost.title,
            tags: [newPost.tag].filter(Boolean),
            comments: []
          }, ...prev.posts] 
        }));
        closeModal();
      } else {
        const errorData = await response.json();
        console.error('Failed to create post:', errorData);
        throw new Error('Failed to create post');
      }
    } catch (err) {
      console.error('Failed to create post:', err);
      setError('Failed to create post: ' + (err instanceof Error ? err.message : String(err)));
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

  const handlePostComment = async () => {
    if (!newComment.trim() || !currentUser?.id || !selectedPost?.id) {
      setError('Please enter a comment and make sure you are logged in');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/Comment/post/${selectedPost.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newComment.trim(),
          posterId: currentUser.id,
          postId: selectedPost.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      // Refresh comments after posting
      await fetchComments(selectedPost.id);
      setNewComment("");
      setCommentTab('view');
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment');
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        console.log('Attempting to delete post:', postId);
        const response = await fetch(`http://localhost:3001/api/posts/${postId}`, {
          method: 'DELETE',
        });
        
        console.log('Delete response:', response);
        const responseData = await response.json();
        console.log('Delete response data:', responseData);
        
        if (response.ok) {
          console.log('Post deleted successfully, updating UI');
          // Only update the UI if the server deletion was successful
          setUser(prev => ({
            ...prev,
            posts: prev.posts.filter(post => post.id !== postId)
          }));
        } else {
          console.error('Failed to delete post:', responseData);
          throw new Error('Failed to delete post');
        }
      } catch (err) {
        console.error('Error deleting post:', err);
        setError('Failed to delete post: ' + (err instanceof Error ? err.message : String(err)));
      }
    }
  };

  // Add function to fetch comments
  const fetchComments = async (postId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/Comment/post/${postId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const comments = await response.json();
      setPostComments(comments);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to fetch comments');
    }
  };

  // Modify handleViewPost to not fetch comments immediately
  const handleViewPost = (post: any) => {
    setSelectedPost(post);
    setCommentsLoaded(false);
    setPostComments([]);
  };

  // Add function to handle view comments button click
  const handleViewComments = async () => {
    if (!selectedPost?.id) return;
    setCommentTab('view');
    await fetchComments(selectedPost.id);
    setCommentsLoaded(true);
  };

  // At the start of the component
  console.log('AccountPage rendered with user state:', user);

  return (
    <div className="account-container">
      <Header />
      
      <div className="profile-header">
        <div className="profile-pic-container" onClick={handleRemoveProfilePic}>
          {user.profilePic ? (
            <img src={user.profilePic} alt="" className="profile-pic" />
          ) : (
            <div className="profile-pic" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '50%', width: 120, height: 120 }}>
              <FaUser style={{ fontSize: 64, color: '#a0a0a0' }} />
            </div>
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

      

      <div className="profile-divider"></div>

      <div className="image-grid">
        {user.posts.map((post) => (
          <div key={post.id} className="post-container">
            <img src={post.image} alt={post.caption} className="post-img" />
            <div className="post-hover-overlay">
              <div className="post-actions">
                <button 
                  onClick={() => handleViewPost(post)}
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
                  onClick={handleViewComments}
                  className={`tab-btn ${commentTab === 'view' ? 'active' : ''}`}
                >
                  View Comments
                </button>
                <button 
                  onClick={() => setCommentTab('post')}
                  className={`tab-btn ${commentTab === 'post' ? 'active' : ''}`}
                >
                  Post Comment
                </button>
              </div>
              {commentTab === 'view' && (
                <>
                  {commentsLoaded ? (
                    <div className="comments-list">
                      {postComments.map((comment) => (
                        <Comment key={comment.id} comment={comment} />
                      ))}
                    </div>
                  ) : (
                    <p>Loading comments...</p>
                  )}
                </>
              )}
              {commentTab === 'post' && (
                <>
                  <textarea
                    placeholder="Write your comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="comment-textarea"
                  />
                  <button onClick={handlePostComment} className="post-comment-btn">Post Comment</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;