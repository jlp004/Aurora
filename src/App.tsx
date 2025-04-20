import './styles/App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Landing
import Login from './app/landingPage/login'
import Signup from './app/landingPage/signup';

import Home from './app/Home'
import Search from './app/SearchPage'
import PageNotFound from './app/PageNotFound';
import Logout from './app/logOut';
import AccountPage from './app/AccountPage';
import Settings from './app/Settings';
import ChatsPage from './app/ChatsPage';

// Import Navbar
import Navbar from './components/Navbar';

function App() {  
  return (
    <Router>
      {/* Render the Navbar, it will appear across all pages */}
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<PageNotFound />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chats" element={<ChatsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
