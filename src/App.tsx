import './styles/App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './app/LoginForm'
import Home from './app/Home'
import Search from './app/SearchPage'
import PageNotFound from './app/PageNotFound';
import Logout from './app/logOut';
import AccountPage from './app/AccountPage';
import Settings from './app/Settings';

function App() {  
  return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginForm />}></Route>
        <Route path="/home" element={<Home />}></Route>
        <Route path="/search" element={<Search />}></Route>
        <Route path="/logout" element={<Logout />} />

        <Route path="*" element = {<PageNotFound />} />
        <Route path="/account" element={<AccountPage/>}></Route>
        <Route path="/settings" element={<Settings/>}/>
      </Routes>
  )
}

export default App
