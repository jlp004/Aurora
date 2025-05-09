import SearchBar from '../components/SearchBar'
import '../styles/Header.css'
import HamburgerMenu from '../components/HamburgerMenu'

// Written by John Phelan - jlp220005
// Container for the hamburger menu and the searchbar to stay above other elements being rendered

const Header = () => {
  return (
    <>
      <div className='background-div'>
        <h1 className='aurora-title'>Aurora</h1>
        <HamburgerMenu />
        <SearchBar />
      </div>
    </>
  )
}

export default Header