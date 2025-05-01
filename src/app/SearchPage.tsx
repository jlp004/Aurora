// Written by Charitha Sarraju and John Phelan
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

  useEffect(() => {
    const fetchPosts = async () => {
      if (!query) return

      try {
        const res = await fetch(`/api/posts/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setPosts(data.posts || [])
        console.log("Search results:", data) 
      } catch (err) {
        console.error("Failed to fetch posts:", err)
      }
    }

    fetchPosts()
  }, [query])

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
      zIndex: 0,      //set at bottom of z index
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
      <div style={{display: 'flex'}}>
        <button className="search-by-button">
            Search Posts
        </button>
        <button className="search-by-button">
            Search Users
        </button>
      </div>

      
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
              timePosted={new Date(post.createdAt).toLocaleString() || "Unknown"}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default SearchPage
/////////////////////////////////////////////
