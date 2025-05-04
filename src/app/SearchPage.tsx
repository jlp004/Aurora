import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Post from '../components/Post'
import { useTheme } from '../context/ThemeContext'

// overwrite some stuff from posts-found-container
const customStyles = `
  .posts-found-container .post {
    margin: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
  }
`;

const SearchPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)
  const query = params.get('query')
  const timeFilter = params.get('timeFilter') || 'all'
  const { theme } = useTheme()

  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([]) 
  const [searchType, setSearchType] = useState<'posts' | 'users'>('posts') 

  const getTimeFilterLabel = (filter: string) => {
    switch (filter) {
      case 'lastMinute': return 'Last Minute';
      case 'lastDay': return 'Last 24 Hours';
      case 'lastWeek': return 'Last Week';
      default: return 'All Time';
    }
  }

  const handleTimeFilterChange = (newFilter: string) => {
    console.log('Changing time filter to:', newFilter);
    const newParams = new URLSearchParams();
    if (query) {
      newParams.set('query', query);
    }
    newParams.set('timeFilter', newFilter);
    const newUrl = `/search?${newParams.toString()}`;
    console.log('Navigating to:', newUrl);
    navigate(newUrl);
  }

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        console.log('Fetching posts with filter:', timeFilter);
        const url = `http://localhost:3001/api/posts/search?${query ? `q=${encodeURIComponent(query)}&` : ''}timeFilter=${encodeURIComponent(timeFilter)}`;
        console.log('Search URL:', url);
        
        const res = await fetch(url);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch posts');
        }
        const data = await res.json();
        console.log("Raw post search results:", data);
        
        // Process and validate timestamps
        const now = new Date();
        console.log('Current time for filtering:', now.toISOString());
        
        const postsWithValidDates = data.data.map((post: any) => {
          const postDate = new Date(post.createdAt);
          const isValidDate = !isNaN(postDate.getTime());
          
          if (!isValidDate) {
            console.warn('Invalid date found for post:', post);
          }
          
          return {
            ...post,
            createdAt: isValidDate ? postDate.toISOString() : now.toISOString()
          };
        });
        
        console.log("Final processed posts:", postsWithValidDates);
        setPosts(postsWithValidDates);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setPosts([]);
      }
    }

    const fetchUsers = async () => {
      try {
        console.log('Fetching users for query:', query)
        const res = await fetch(`http://localhost:3001/api/chat/search-users?query=${encodeURIComponent(query)}`)
        console.log('Response status:', res.status)
        if (!res.ok) {
          throw new Error('Failed to fetch users')
        }
        const data = await res.json()
        console.log("Raw API response:", data)
        
        setUsers(data.users || [])
      } catch (err) {
        console.error("Failed to fetch users:", err)
        setUsers([])
      }
    }

    if (searchType === 'posts') {
      fetchPosts();
    } else {
      fetchUsers();
    }
  }, [query, searchType, timeFilter, location.search]);

  return (
    <div style={{ 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      minHeight: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgb(26, 22, 78) 0%, rgb(122, 50, 124) 100%)',
      zIndex: 0,
      overflowY: 'auto' 
    }}>
      <style>{customStyles}</style>
      <Header />
      
      <div style={{ width: '100%', maxWidth: '1000px', padding: '0 20px' }}>
        <h1 
          style={{ color: '#fff', fontSize: '40px', textAlign: 'center', marginTop: '6rem', marginBottom: '1rem'}}
        >
          <b>{query ? `Search results for "${query}"` : 'All Posts'}</b>
        </h1>
        {searchType === 'posts' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '1rem' }}>
            <button 
              className={`filter-btn${timeFilter === 'all' ? ' selected' : ''}`}
              onClick={() => handleTimeFilterChange('all')}
            >
              All Time
            </button>
            <button 
              className={`filter-btn${timeFilter === 'lastMinute' ? ' selected' : ''}`}
              onClick={() => handleTimeFilterChange('lastMinute')}
            >
              Last Minute
            </button>
            <button 
              className={`filter-btn${timeFilter === 'lastDay' ? ' selected' : ''}`}
              onClick={() => handleTimeFilterChange('lastDay')}
            >
              Last 24 Hours
            </button>
            <button 
              className={`filter-btn${timeFilter === 'lastWeek' ? ' selected' : ''}`}
              onClick={() => handleTimeFilterChange('lastWeek')}
            >
              Last Week
            </button>
          </div>
        )}
      </div>

      <div style={{display: 'flex', gap: '10px', marginBottom: '1rem'}}>
        <button 
          className={`search-by-button${searchType === 'posts' ? ' selected' : ''}`}
          onClick={() => setSearchType('posts')}
        >
          Search Posts
        </button>
        <button 
          className={`search-by-button${searchType === 'users' ? ' selected' : ''}`}
          onClick={() => setSearchType('users')}
        >
          Search Users
        </button>
      </div>

      {searchType === 'posts' ? (
        <div className="post-feed">
          {posts.length === 0 ? (
            <p style={{ color: '#fff', textAlign: 'center', width: '100%' }}>
              No posts found.
            </p>
          ) : (
            posts.map((post: any) => (
              <Post
                key={post.id}
                username={post.user?.username || "Unknown"} 
                imageUrl={post.pictureURL || "../../images/img4.png"} 
                caption={post.title}
                likes={post.likes || 0}
                comments={post.Comment?.length || 0}
                timePosted={post.createdAt}
              />
            ))
          )}
        </div>
      ) : (
        <div className="user-results" style={{ width: '100%', maxWidth: '600px', padding: '0 20px' }}>
          {users.length === 0 ? (
            <p style={{ color: '#fff', textAlign: 'center' }}>
              No users found.
            </p>
          ) : (
            users.map((user: any) => {
              console.log('Rendering user:', user)
              return (
                <div 
                  key={user.id} 
                  onClick={() => navigate(`/profile?userID=${user.username}`)}
                  style={{ 
                    backgroundColor: 'var(--bg-primary)', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer'
                  }}
                >
                  <img 
                    src={user.pictureURL || '../../images/default-user.png'} 
                    alt="Profile" 
                    style={{ 
                      width: '50px', 
                      height: '50px', 
                      borderRadius: '50%',
                      marginRight: '1rem'
                    }} 
                  />
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{user.username}</h3>
                    <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>{user.profileDesc || "No bio provided."}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default SearchPage
