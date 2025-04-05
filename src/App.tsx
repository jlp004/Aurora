import { useState } from 'react'
import './styles/App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm'
import Home from './components/Home'

function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginForm />}></Route>
        <Route path="/home" element={<Home />}></Route>
      </Routes>
    </Router>
  )
}

export default App
