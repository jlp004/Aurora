import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Post from '../components/Post'

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
          style={{ color: '#fff', fontSize: '40px', textAlign: 'center', marginTop: '6rem', marginBottom: '1rem'}}>
          <b>{query ? `Search results for "${query}"` : 'All Posts'}</b>
        </h1>
        {searchType === 'posts' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '1rem' }}>
            <button 
              onClick={() => handleTimeFilterChange('all')}
              style={{ 
                background: timeFilter === 'all' ? '#fff' : '#ccc',
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                color: timeFilter === 'all' ? '#000' : '#fff'
              }}
            >
              All Time
            </button>
            <button 
              onClick={() => handleTimeFilterChange('lastMinute')}
              style={{ 
                background: timeFilter === 'lastMinute' ? '#fff' : '#ccc',
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                color: timeFilter === 'lastMinute' ? '#000' : '#fff'
              }}
            >
              Last Minute
            </button>
            <button 
              onClick={() => handleTimeFilterChange('lastDay')}
              style={{ 
                background: timeFilter === 'lastDay' ? '#fff' : '#ccc',
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                color: timeFilter === 'lastDay' ? '#000' : '#fff'
              }}
            >
              Last 24 Hours
            </button>
            <button 
              onClick={() => handleTimeFilterChange('lastWeek')}
              style={{ 
                background: timeFilter === 'lastWeek' ? '#fff' : '#ccc',
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                color: timeFilter === 'lastWeek' ? '#000' : '#fff'
              }}
            >
              Last Week
            </button>
          </div>
        )}
      </div>

      <div style={{display: 'flex', gap: '10px', marginBottom: '1rem'}}>
        <button 
          className="search-by-button"
          onClick={() => setSearchType('posts')}
          style={{ background: searchType === 'posts' ? '#fff' : '#ccc' }}
        >
          Search Posts
        </button>
        <button 
          className="search-by-button"
          onClick={() => setSearchType('users')}
          style={{ background: searchType === 'users' ? '#fff' : '#ccc' }}
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
                <div key={user.id} style={{ 
                  backgroundColor: '#fff', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
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
                    <h3 style={{ margin: 0 }}>{user.username}</h3>
                    <p style={{ margin: '0.5rem 0 0 0' }}>{user.profileDesc || "No bio provided."}</p>
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
