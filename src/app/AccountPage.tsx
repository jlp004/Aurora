/*page by hishita shah hrs220004*/
import { useState, useEffect } from 'react';
import '../styles/AccountPage.css';
import Header from "../components/Header";
import "../styles/HamburgerMenu.css";
import Comment from "../components/Comment";
import { useUser } from './userData';
import { FaUser } from 'react-icons/fa';

// Add UserType interface if not already present or import it
interface UserType {
  id: number;
  username: string;
  email?: string; // Make optional if not always needed
  pictureURL?: string;
  profileDesc?: string;
  followers?: number;
  following?: number;
}

interface PostData {
  id: number;
  pictureURL: string;
  title: string;
  tag?: string;
  createdAt: string;
}

interface User {
  id: number;
  username: string;
  profileDesc?: string;
  pictureURL?: string;
  followers?: number;
  following?: number;
}

const AccountPage = () => {
  const { currentUser, setCurrentUser } = useUser();

  const [user, setUser] = useState({
    id: currentUser?.id || 1,
    username: currentUser?.username || "user123",
    bio: currentUser?.profileDesc || "No bio yet",
    followers: 0,
    following: 0,
    profilePic: currentUser?.pictureURL || "",
    posts: []
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newPostComment, setNewPostComment] = useState("");
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [commentTab, setCommentTab] = useState<'view' | 'post'>('view');
  const [newComment, setNewComment] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [profileUploadStatus, setProfileUploadStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<any[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  // --- Modal State (Copied from UserProfile) ---
  const [modalType, setModalType] = useState<'followers' | 'following' | null>(null);
  const [modalUsers, setModalUsers] = useState<UserType[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  // --- End Modal State ---

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
          const response = await fetch(`http://localhost:3001/api/User/${currentUser.id}`);
          if (response.ok) {
            const responseData = await response.json();
            console.log('User data response:', responseData);

            if (responseData.users && responseData.users.length > 0) {
              const userData = responseData.users[0];
              console.log('Extracted userData:', userData);

              setUser(prev => ({
                ...prev,
                id: userData.id,
                username: userData.username || prev.username,
                profilePic: userData.pictureURL || prev.profilePic,
                bio: userData.profileDesc || prev.bio,
                followers: userData.followers ?? 0,
                following: userData.following ?? 0
              }));
            } else {
              console.error('No users found in API response:', responseData);
              setError('No user data found for your account.');
            }
          } else {
            const errorText = await response.text();
            console.error('Failed to fetch user data:', response.status, errorText);
            setError(`Failed to fetch user data (${response.status})`);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('An error occurred while fetching user data.');
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
            tags: post.tag ? post.tag.split(',') : [],
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

  // Force reload of profile pictures globally
  const forceReloadProfilePictures = (newImageUrl: string) => {
    // 1. Add a small delay to ensure DOM updates have occurred
    setTimeout(() => {
      // 2. Find all profile pictures in the document
      const allProfilePics = document.querySelectorAll('img[src*="profile-pic"], img[src*="pictureURL"], img.profile-pic, .profile-pic > img');

      console.log('Found profile pictures to update:', allProfilePics.length);

      // 3. Update each image source to the new URL
      allProfilePics.forEach(img => {
        const imgElement = img as HTMLImageElement;
        // Skip non-matching urls (other users' pictures)
        if (imgElement.src.includes('default_avatar') ||
          (currentUser?.pictureURL && imgElement.src.includes(currentUser.pictureURL.split('?')[0]))) {
          console.log('Updating img src from', imgElement.src, 'to', newImageUrl);
          // Force browser to reload the image
          imgElement.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // 1x1 transparent gif
          // Trigger reflow
          void imgElement.offsetWidth;
          // Set the new image URL
          imgElement.src = newImageUrl;
        }
      });

      // 4. Update background images (in case profile pic is used as background)
      const elementsWithBgImage = document.querySelectorAll('[style*="background"]');
      elementsWithBgImage.forEach(el => {
        const element = el as HTMLElement;
        const style = window.getComputedStyle(element);
        const bgImage = style.backgroundImage;

        if (currentUser?.pictureURL && bgImage.includes(currentUser.pictureURL.split('?')[0])) {
          console.log('Updating background image from', bgImage, 'to', newImageUrl);
          element.style.backgroundImage = `url("${newImageUrl}")`;
        }
      });
    }, 100);
  };

  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadLoading(true);
      setProfileUploadStatus('Uploading...');
      setError(null);

      // Create the form data with the image and user ID
      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', currentUser?.id.toString() || '0');

      // Upload to server
      const response = await fetch('http://localhost:3001/api/upload/profile', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Server response:', data);

        // Success! Show message and reload the page after a brief delay
        setProfileUploadStatus('Profile updated! Refreshing...');

        // Update local state for immediate feedback
        if (data.imageUrl) {
          const localUrl = URL.createObjectURL(file);
          setUser(prev => ({
            ...prev,
            profilePic: localUrl
          }));
        }

        // Force page reload after a slight delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload: ' + (err instanceof Error ? err.message : String(err)));
      setProfileUploadStatus('');
    } finally {
      // Don't set uploadLoading to false since we're reloading the page
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
      setIsCreatePostModalOpen(true);
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
    setIsCreatePostModalOpen(false);
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

  // --- Modal Functions (Copied from UserProfile) ---
  const fetchModalData = async (type: 'followers' | 'following', profileUserId: number) => {
    setModalLoading(true);
    setModalError(null);
    setModalUsers([]); // Clear previous users

    try {
      const baseUrl = 'http://localhost:3001';
      const endpoint = type === 'followers'
        ? `${baseUrl}/api/user/${profileUserId}/followers`
        : `${baseUrl}/api/user/${profileUserId}/following`;

      console.log(`Fetching modal data from: ${endpoint}`);
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${type}`);
      }

      const data = await response.json();
      console.log(`Received modal data for ${type}:`, data);
      // Ensure data structure is handled correctly (assuming { users: [...] })
      const usersData = data.users || (Array.isArray(data) ? data : []);
      setModalUsers(usersData);

    } catch (err: any) {
      console.error(`Error fetching modal data for ${type}:`, err);
      setModalError(err.message || `Failed to load ${type}`);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenModal = (type: 'followers' | 'following') => {
    if (!currentUser?.id) return;
    const profileUserId = typeof currentUser.id === 'string' ? parseInt(currentUser.id, 10) : currentUser.id;
    if (isNaN(profileUserId)) return;
    setModalType(type);
    setIsFollowModalOpen(true);
    fetchModalData(type, profileUserId);
  };

  const handleCloseModal = () => {
    setIsFollowModalOpen(false);
    setModalType(null);
    setModalUsers([]);
    setModalLoading(false);
    setModalError(null);
  };
  // --- End Modal Functions ---

  // --- Add handleEditPost and confirmEditPost ---
  const handleEditPost = (post) => {
    setEditingPost({ ...post, tags: post.tags || [] }); // Ensure tags is an array
    setSelectedImage(post.image); // Pre-fill image (though not editable here)
    setNewPostComment(post.caption); // Pre-fill caption
    setSelectedTags(post.tags || []); // Pre-fill tags
    setIsEditModalOpen(true);
  };

  const confirmEditPost = async () => {
    if (!editingPost) return;

    try {
      const postData = {
        title: editingPost.caption, // Use caption from editingPost state
        tags: editingPost.tags.join(','),     // JOIN the tags array into a comma-separated string
        // userId and pictureURL are generally not updated here
      };

      console.log(`Updating post ${editingPost.id} with data:`, postData);

      const response = await fetch(`http://localhost:3001/api/posts/${editingPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      console.log('Update post response:', response);

      if (response.ok) {
        const updatedPostFromServer = await response.json();
        console.log('Updated post from server:', updatedPostFromServer);

        // Update local state with the confirmed edited post data
        setUser(prev => ({
          ...prev,
          posts: prev.posts.map(post =>
            post.id === editingPost.id ? { ...post, ...editingPost } : post // Merge changes
          )
        }));
        closeModal(); // Close modal and reset state
      } else {
        const errorData = await response.json();
        console.error('Failed to update post:', errorData);
        throw new Error(errorData.message || 'Failed to update post');
      }
    } catch (err) {
      console.error('Error updating post:', err);
      setError(err instanceof Error ? err.message : 'Failed to update post');
      // Optionally keep the modal open if there's an error? Or close it?
      // closeModal(); 
    }
  };
  // --- End Add handleEditPost and confirmEditPost ---

  // At the start of the component
  console.log('AccountPage rendered with user state:', user);

  return (
    <div className="account-container">
      <Header />

      <div className="profile-header">
        <div className="profile-pic-container" onClick={handleRemoveProfilePic}>
          {user?.profilePic ? (
            <img src={user.profilePic} alt="" className="profile-pic" />
          ) : (
            <div className="profile-pic" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '50%', width: 120, height: 120 }}>
              <FaUser style={{ fontSize: 64, color: '#a0a0a0' }} />
            </div>
          )}
          {uploadLoading ? (
            <div className="upload-status">Uploading...</div>
          ) : profileUploadStatus ? (
            <div className="upload-status success">{profileUploadStatus}</div>
          ) : null}
          <div className="profile-pic-overlay">Click to remove</div>
        </div>

        <div className="user-info">
          <h2>{user?.username}</h2>
          <p>{user?.bio}</p>

          <div className="stats">
            <span><strong>{user?.posts.length}</strong> Posts</span>
            <span className="stat-link" onClick={() => handleOpenModal('followers')}>
              <strong>{user?.followers ?? 0}</strong> Followers
            </span>
            <span className="stat-link" onClick={() => handleOpenModal('following')}>
              <strong>{user?.following ?? 0}</strong> Following
            </span>
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
        {user?.posts.map((post) => (
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
                    e.stopPropagation(); // Prevent triggering handleViewPost if elements overlap
                    handleEditPost(post); // Call the new edit handler
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
      {isCreatePostModalOpen && selectedImage && (
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
                        <Comment
                          key={comment.id}
                          text={comment.text}
                          poster={comment.poster?.username || 'Unknown'}
                        />
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

      {/* --- Modal JSX (Copied from UserProfile) --- */}
      {isFollowModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content follow-modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>×</button>
            <h2>{modalType === 'followers' ? 'Followers' : 'Following'}</h2>
            <div className="follow-list">
              {modalLoading && <p>Loading...</p>}
              {modalError && <p className="error-message">{modalError}</p>}
              {!modalLoading && !modalError && modalUsers.length === 0 && (
                <p>No users found.</p>
              )}
              {!modalLoading && !modalError && modalUsers.map((modalUser) => (
                <div key={modalUser.id} className="follow-list-item">
                  <img
                    src={modalUser.pictureURL?.replace('/public', '') || '/images/default_avatar.png'}
                    alt={modalUser.username}
                    className="follow-list-pfp"
                  />
                  {/* TODO: Make username a link later */}
                  <span className="follow-list-username">{modalUser.username}</span>
                  {/* Optional: Add follow/unfollow button here later */}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- Add Edit Post Modal JSX --- */}
      {isEditModalOpen && editingPost && (
        <div className='modal-overlay' onClick={closeModal}>
          <div className='modal-content' onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <h3>Edit Post</h3>
            {/* Display existing image - usually not editable */}
            <img src={editingPost.image} alt="Post Preview" className='modal-preview-img' />

            <textarea
              placeholder='Edit caption...'
              value={editingPost.caption} // Use editingPost state
              onChange={(e) => setEditingPost({ ...editingPost, caption: e.target.value })}
              className='modal-caption'
            />

            <div className='modal-tags'>
              <h4>Edit Tags:</h4>
              <div className='tag-buttons'>
                {predefinedTags.map(tag => (
                  <button
                    key={tag}
                    className={`tag-btn ${editingPost.tags?.includes(tag) ? 'active' : ''}`}
                    onClick={() => {
                      const currentTags = editingPost.tags || [];
                      const updatedTags = currentTags.includes(tag)
                        ? currentTags.filter(t => t !== tag)
                        : [...currentTags, tag];
                      setEditingPost({ ...editingPost, tags: updatedTags });
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={closeModal}>Cancel</button>
              {/* Call confirmEditPost to save changes */}
              <button className="modal-btn confirm" onClick={confirmEditPost}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
      {/* --- End Add Edit Post Modal JSX --- */}
    </div>
  );
};

export default AccountPage;