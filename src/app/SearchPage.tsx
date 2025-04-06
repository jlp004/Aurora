import { useLocation } from 'react-router-dom'
import Header from '../components/Header'

// Written by John Phelan - jlp220005
// Parse the URL for the string to be queried for
// Upon querying, display the found results
// Currently unfinished

const SearchPage = () => {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const query = params.get('query')

  return (
    <>
      <Header />
      <div>
        <h1 style={{ color: 'black' }}>Search Page</h1>
        <p style={{ color: 'black' }}>Search query: {query}</p>
      </div>
    </>
  )
}

export default SearchPage
