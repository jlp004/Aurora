import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'
import '../styles/SearchBar.css'
import { 
    FaSearch, 
    FaTimes, 
    FaMicrophone, 
    FaFilter, 
    FaSun, 
    FaMoon, 
    FaBell, 
    FaUser,
    FaCog,
    FaSignOutAlt
} from 'react-icons/fa'

// written by John Phelan - jlp220005
// handles rendering the search bar and redirecting the user to the search page for the string input.

interface SearchSuggestion {
    id: string;
    type: 'user' | 'post';
    text: string;
}

interface HeaderProps {
    onThemeToggle?: () => void;
}

const SearchBar: React.FC<HeaderProps> = ({ onThemeToggle }) => {
    const [inputValue, setInputValue] = useState('')
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)
    const filterRef = useRef<HTMLDivElement>(null)
    const userMenuRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setShowFilters(false)
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Debounced search function
    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputValue) {
                setIsLoading(true)
                fetchSuggestions(inputValue)
            } else {
                setSuggestions([])
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [inputValue])

    // Keyboard shortcut for focus
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === '/' && !isFocused) {
                e.preventDefault()
                const input = searchRef.current?.querySelector('input')
                if (input) input.focus()
            }
        }
        document.addEventListener('keydown', handleKeyPress)
        return () => document.removeEventListener('keydown', handleKeyPress)
    }, [isFocused])

    const fetchSuggestions = async (query: string) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500))
            const mockSuggestions: SearchSuggestion[] = [
                { id: '1', type: 'user', text: 'user123' },
                { id: '2', type: 'post', text: 'Recent post about...' },
            ]
            setSuggestions(mockSuggestions)
        } catch (error) {
            console.error('Error fetching suggestions:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if(event.key === "Enter") {
            navigate(`/search?query=${inputValue}`)      
        }
    }

    const handleClear = () => {
        setInputValue('')
        setSuggestions([])
    }

    const handleThemeToggle = () => {
        setIsDarkMode(!isDarkMode)
        if (onThemeToggle) onThemeToggle()
    }

    return (
        <div className="header-wrapper">
            <div className="input-group" ref={searchRef}>
                <div className={`search-wrapper ${isFocused ? 'focused' : ''}`}>
                    <FaSearch className="search-icon" />
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="search-bar" 
                        placeholder="Search" 
                        aria-label="Search..." 
                        aria-describedby="basic-addon1"
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                    {inputValue && (
                        <button className="clear-button" onClick={handleClear}>
                            <FaTimes />
                        </button>
                    )}
                    <button 
                        className="filter-button" 
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FaFilter />
                    </button>
                    <button className="voice-button">
                        <FaMicrophone />
                    </button>
                </div>

                {/* Suggestions dropdown */}
                {(isLoading || suggestions.length > 0) && isFocused && (
                    <div className="suggestions-dropdown">
                        {isLoading ? (
                            <div className="suggestion-loading">
                                <div className="loading-line"></div>
                                <div className="loading-line"></div>
                                <div className="loading-line"></div>
                            </div>
                        ) : (
                            suggestions.map(suggestion => (
                                <div 
                                    key={suggestion.id} 
                                    className="suggestion-item"
                                    onClick={() => {
                                        setInputValue(suggestion.text)
                                        setSuggestions([])
                                    }}
                                >
                                    {suggestion.type === 'user' ? '👤 ' : '📝 '}
                                    {suggestion.text}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Filters Panel */}
                {showFilters && (
                    <div className="filters-panel" ref={filterRef}>
                        <h3>Search Filters</h3>
                        <div className="filter-section">
                            <label>Content Type</label>
                            <div className="filter-option">
                                <input type="checkbox" id="posts" />
                                <label htmlFor="posts">Posts</label>
                            </div>
                            <div className="filter-option">
                                <input type="checkbox" id="users" />
                                <label htmlFor="users">Users</label>
                            </div>
                        </div>
                        <div className="filter-section">
                            <label>Date Range</label>
                            <div className="filter-option">
                                <input type="radio" name="date" id="all" />
                                <label htmlFor="all">All Time</label>
                            </div>
                            <div className="filter-option">
                                <input type="radio" name="date" id="recent" />
                                <label htmlFor="recent">Past Week</label>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Header Controls */}
            <div className="header-controls">
                <button className="theme-toggle" onClick={handleThemeToggle}>
                    {isDarkMode ? <FaSun /> : <FaMoon />}
                </button>
                
                <div className="notifications-badge">
                    <button className="notifications-bell">
                        <FaBell />
                    </button>
                    <span className="notifications-count">3</span>
                </div>

                <div className="user-avatar" ref={userMenuRef}>
                    <button onClick={() => setShowUserMenu(!showUserMenu)}>
                        <FaUser />
                    </button>
                    
                    {showUserMenu && (
                        <div className="user-menu">
                            <div className="user-menu-item">
                                <FaUser />
                                Profile
                            </div>
                            <div className="user-menu-item">
                                <FaCog />
                                Settings
                            </div>
                            <div className="user-menu-item">
                                <FaSignOutAlt />
                                Sign Out
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchBar;
