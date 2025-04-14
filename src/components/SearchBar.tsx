import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import '../styles/SearchBar.css'

// written by John Phelan - jlp220005
// handles rendering the search bar and redirecting the user to the search page for the string input.

const SearchBar = () => {
    const [inputValue, setInputValue] = useState('')
    const navigate = useNavigate()

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if(event.key == "Enter") {
            // this may have to be changed depending on how search is implemented
            navigate(`/search?query=${inputValue}`)      
        }
    }

  return (
    <>
        <div className="input-group">
            <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="search-bar" 
                placeholder="Search..." 
                aria-label="Search..." 
                aria-describedby="basic-addon1"
                onKeyDown={handleKeyDown} 
            />
        </div>
    </>
  );
};

export default SearchBar;
