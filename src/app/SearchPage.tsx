import { useLocation } from 'react-router-dom'
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
  const params = new URLSearchParams(location.search)
  const query = params.get('query')

  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([]) 
  const [searchType, setSearchType] = useState<'posts' | 'users'>('posts') 

  useEffect(() => {
    if (!query) return

    const fetchPosts = async () => {
      try {
        const res = await fetch(`/api/posts/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setPosts(data.posts || [])
        console.log("Post search results:", data)
      } catch (err) {
        console.error("Failed to fetch posts:", err)
      }
    }

    const fetchUsers = async () => {
      try {
        console.log('Fetching users for query:', query)
        const res = await fetch(`/api/User/${encodeURIComponent(query)}`)
        console.log('Response status:', res.status)
        if (!res.ok) {
          throw new Error('Failed to fetch users')
        }
        const data = await res.json()
        console.log("Raw API response:", data)
        
        // Handle both array and single user responses
        const usersArray = Array.isArray(data.users) ? data.users : 
                          data.users ? [data.users] : 
                          data.id ? [data] : [];
        
        console.log("Processed users array:", usersArray)
        setUsers(usersArray)
      } catch (err) {
        console.error("Failed to fetch users:", err)
        setUsers([])
      }
    }

    if (searchType === 'posts') {
      fetchPosts()
    } else {
      fetchUsers()
    }
  }, [query, searchType]) 

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
          <b>Search results for "{query}"</b>
        </h1>
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
