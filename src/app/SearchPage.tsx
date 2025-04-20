// import { useLocation } from 'react-router-dom'
// import Header from '../components/Header'
// import Post from '../components/Post'

// /* Written by John Phelan - jlp220005
//  * Parse the URL for the string to be queried for
//  * Upon querying, display the found results
//  * No database to pull from; hard coded values
//  */ 

// const SearchPage = () => {
//   const location = useLocation()
//   const params = new URLSearchParams(location.search)
//   const query = params.get('query')

//   return (
//     <>
//       <Header />
//       <div>
//         <h1 
//           style={{ color: 'white', fontSize: '40px', textAlign: 'center',  }}>
//           <b>Search results for {query}</b>
//         </h1>
//       </div>
//       <div className='posts-found-container'>
//         <Post  
//           username="DifferentUser"
//           imageUrl="../../images/img4.png"
//           caption="Check this out ^^^"
//           likes={20}
//           comments={5}
//           timePosted="3 days ago"
//         />
//       </div>
//     </>
//   )
// }

// export default SearchPage
///////////////////////////////////////////////////////////////
import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Post from '../components/Post'

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
        setPosts(data.posts)
      } catch (err) {
        console.error("Failed to fetch posts:", err)
      }
    }

    fetchPosts()
  }, [query])

  return (
    <>
      <Header />
      <div>
        <h1 
          style={{ color: 'white', fontSize: '40px', textAlign: 'center' }}>
          <b>Search results for "{query}"</b>
        </h1>
      </div>

      <div className='posts-found-container'>
        {posts.length === 0 ? (
          <p style={{ color: 'white', textAlign: 'center' }}>
            No posts found.
          </p>
        ) : (
          posts.map((post: any) => (
            <Post
              key={post.id}
              username={post.author?.username || "Unknown"} // or however you store authors
              imageUrl={post.imageUrl || "../../images/img4.png"} // fallback if missing
              caption={post.title}
              likes={post.likes || 0}
              comments={post.comments?.length || 0}
              timePosted={post.createdAt || "Unknown"}
            />
          ))
        )}
      </div>
    </>
  )
}

export default SearchPage
/////////////////////////////////////////////
