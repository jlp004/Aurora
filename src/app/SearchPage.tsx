import { useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Post from '../components/Post'

/* Written by John Phelan - jlp220005
 * Parse the URL for the string to be queried for
 * Upon querying, display the found results
 * No database to pull from; hard coded values
 */ 

const SearchPage = () => {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const query = params.get('query')

  return (
    <>
      <Header />
      <div>
        <h1 
          style={{ color: 'white', fontSize: '40px', textAlign: 'center',  }}>
          <b>Search results for {query}</b>
        </h1>
      </div>
      <div className='posts-found-container'>
        <Post  
          username="DifferentUser"
          imageUrl="../../images/img4.png"
          caption="Check this out ^^^"
          likes={20}
          comments={5}
          timePosted="3 days ago"
        />
      </div>
    </>
  )
}

export default SearchPage
