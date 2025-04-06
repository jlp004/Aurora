import SearchBar from '../components/SearchBar'
import DropDownMenu from '../components/HamburgerMenu'
import '../styles/Header.css'

// Written by John Phelan - jlp220005
// Container for the hamburger menu and the searchbar to stay above other elements being rendered

const Header = () => {
  return (
    <>
      <div className='background-div'>
        <DropDownMenu />
        <SearchBar />
      </div>
    </>
  )
}

export default Header
