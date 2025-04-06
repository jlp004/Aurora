import Header from '../components/Header'

// Written by John Phelan - jlp220005
// If the user goes to an invalid page

const PageNotFound = () => {
  return (
    <>
      <Header />
      <div>
        <p style={{ color: 'black', fontSize: '100px', textAlign: 'center' }}>
            404 - Page Not Found
        </p>
      </div>
    </>
  )
}

export default PageNotFound
