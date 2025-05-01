import './styles/App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './app/userData';

//Landing
import Login from './app/landingPage/login'
import Signup from './app/landingPage/signup';

import Home from './app/Home'
import Search from './app/SearchPage'
import PageNotFound from './app/PageNotFound';
import Logout from './app/logOut';
import AccountPage from './app/AccountPage';
import Settings from './app/Settings';
import ChatsPage from './app/ChatsPage';

function App() {  
  return (
    <UserProvider>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />}></Route>
          <Route path="/home" element={<Home />}></Route>
          <Route path="/search" element={<Search />}></Route>
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element = {<PageNotFound />} />
          <Route path="/account" element={<AccountPage/>}></Route>
          <Route path="/settings" element={<Settings/>}/>
          <Route path="/signup" element={<Signup/>} />
          <Route path="/chats" element={<ChatsPage/> } />
        </Routes>
      </ThemeProvider>
    </UserProvider>
  )
}

export default App
