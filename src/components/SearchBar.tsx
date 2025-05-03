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
    FaFacebookMessenger, 
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
    onFilterChange?: (filter: string) => void;
}

const SearchBar: React.FC<HeaderProps> = ({ onThemeToggle, onFilterChange }) => {
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

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

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

    const handleMessagesClick = () => {
        navigate('/chats');
    };

    const handleProfileClick = () => {
        navigate('/account');
        setShowUserMenu(false);
    };

    const handleSettingsClick = () => {
        navigate('/settings');
        setShowUserMenu(false);
    };

    const handleLogoutClick = () => {
        navigate('/logout');
        setShowUserMenu(false);
    };

    const handleFilterClick = () => {
        setShowFilters(!showFilters);
    };

    const handleDateFilterChange = (value: string) => {
        setSelectedDateFilter(value);
        if (onFilterChange) {
            onFilterChange(value);
        }
    };

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
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        style={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : undefined }}
                    />
                    {inputValue && (
                        <button className="clear-button" onClick={handleClear}>
                            <FaTimes />
                        </button>
                    )}
                    <button 
                        className="filter-button" 
                        onClick={handleFilterClick}
                    >
                        <FaFilter />
                    </button>
                </div>

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
                                    onChange={() => handleDateFilterChange('all')}
                                />
                                <label htmlFor="all">All Time</label>
                            </div>
                            <div className="filter-option">
                                <input 
                                    type="radio" 
                                    name="date" 
                                    id="last1min" 
                                    checked={selectedDateFilter === '1min'}
                                    onChange={() => handleDateFilterChange('1min')}
                                />
                                <label htmlFor="last1min">Last Minute</label>
                            </div>
                            <div className="filter-option">
                                <input 
                                    type="radio" 
                                    name="date" 
                                    id="last5min" 
                                    checked={selectedDateFilter === '5min'}
                                    onChange={() => handleDateFilterChange('5min')}
                                />
                                <label htmlFor="last5min">Last 5 Minutes</label>
                            </div>
                            <div className="filter-option">
                                <input 
                                    type="radio" 
                                    name="date" 
                                    id="last24h" 
                                    checked={selectedDateFilter === '1day'}
                                    onChange={() => handleDateFilterChange('1day')}
                                />
                                <label htmlFor="last24h">Last 24 Hours</label>
                            </div>
                            <div className="filter-option">
                                <input 
                                    type="radio" 
                                    name="date" 
                                    id="lastWeek" 
                                    checked={selectedDateFilter === '1week'}
                                    onChange={() => handleDateFilterChange('1week')}
                                />
                                <label htmlFor="lastWeek">Last Week</label>
                            </div>
                        </div>
                    </div>
                )}

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
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <div className="header-controls">
                <button className="theme-toggle" onClick={handleThemeToggle}>
                    {theme === 'dark' ? <FaSun /> : <FaMoon />}
                </button>
                
                <div className="notifications-badge">
                    <button className="notifications-bell" onClick={handleMessagesClick}>
                        <FaFacebookMessenger />
                    </button>
                    <span className="notifications-count">3</span>
                </div>

                <div className="user-avatar" ref={userMenuRef}>
                    <button onClick={() => setShowUserMenu(!showUserMenu)}>
                        <FaUser />
                    </button>
                    
                    {showUserMenu && (
                        <div className="user-menu">
                            <div className="user-menu-item" onClick={handleProfileClick}>
                                <FaUser />
                                Profile
                            </div>
                            <div className="user-menu-item" onClick={handleSettingsClick}>
                                <FaCog />
                                Settings
                            </div>
                            <div className="user-menu-item" onClick={handleLogoutClick}>
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
