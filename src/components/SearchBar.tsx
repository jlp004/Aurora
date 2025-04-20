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
import { useTheme } from '../context/ThemeContext';

// written by John Phelan - jlp220005
// handles rendering the search bar and redirecting the user to the search page for the string input.

interface SearchSuggestion {
    id: string;
    type: 'user' | 'post';
    text: string;
    timestamp: Date;
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
    const [selectedDateFilter, setSelectedDateFilter] = useState('all')
    const [currentTime, setCurrentTime] = useState(new Date())
    const searchRef = useRef<HTMLDivElement>(null)
    const filterRef = useRef<HTMLDivElement>(null)
    const userMenuRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const { theme, toggleTheme } = useTheme();

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

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

    // Debounced search function with time filter
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
    }, [inputValue, selectedDateFilter])

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
            const now = new Date();
            
            // Create mock suggestions with dynamic timestamps
            const mockSuggestions: SearchSuggestion[] = [
                { 
                    id: '1', 
                    type: 'user' as const, 
                    text: 'user123', 
                    timestamp: now 
                },
                { 
                    id: '2', 
                    type: 'post' as const, 
                    text: 'Recent post about...', 
                    timestamp: new Date(now.getTime() - 2 * 60 * 1000) // 2 minutes ago
                },
                { 
                    id: '3', 
                    type: 'post' as const, 
                    text: 'Older post about...', 
                    timestamp: new Date(now.getTime() - 10 * 60 * 1000) // 10 minutes ago
                },
                {
                    id: '4',
                    type: 'post' as const,
                    text: 'Post from last week...',
                    timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
                }
            ].filter(suggestion => 
                suggestion.text.toLowerCase().includes(query.toLowerCase())
            );

            // Filter suggestions based on time
            const filteredSuggestions = mockSuggestions.filter(suggestion => {
                const timeDiff = currentTime.getTime() - suggestion.timestamp.getTime();
                
                switch (selectedDateFilter) {
                    case 'last5min':
                        return timeDiff <= 5 * 60 * 1000; // 5 minutes in milliseconds
                    case 'recent':
                        return timeDiff <= 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
                    default:
                        return true;
                }
            });

            setSuggestions(filteredSuggestions)
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
        toggleTheme();
    }

    const formatTimestamp = (timestamp: Date) => {
        const diff = currentTime.getTime() - timestamp.getTime();
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        if (seconds > 30) return `${seconds}s ago`;
        return 'Just now';
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
                                    <span>{suggestion.text}</span>
                                    <span style={{ marginLeft: 'auto', fontSize: '0.8em', color: '#666' }}>
                                        {formatTimestamp(suggestion.timestamp)}
                                    </span>
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
                                <input 
                                    type="radio" 
                                    name="date" 
                                    id="all" 
                                    checked={selectedDateFilter === 'all'}
                                    onChange={() => setSelectedDateFilter('all')}
                                />
                                <label htmlFor="all">All Time</label>
                            </div>
                            <div className="filter-option">
                                <input 
                                    type="radio" 
                                    name="date" 
                                    id="recent" 
                                    checked={selectedDateFilter === 'recent'}
                                    onChange={() => setSelectedDateFilter('recent')}
                                />
                                <label htmlFor="recent">Past Week</label>
                            </div>
                            <div className="filter-option">
                                <input 
                                    type="radio" 
                                    name="date" 
                                    id="last5min" 
                                    checked={selectedDateFilter === 'last5min'}
                                    onChange={() => setSelectedDateFilter('last5min')}
                                />
                                <label htmlFor="last5min">Last 5 Minutes</label>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Header Controls */}
            <div className="header-controls">
                <button className="theme-toggle" onClick={handleThemeToggle}>
                    {theme === 'dark' ? <FaSun /> : <FaMoon />}
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
