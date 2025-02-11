import { useState } from 'react'
import './styles/App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm'

function App() {
  
  return (
    <>
      <LoginForm>Username</LoginForm>
    </>
  )
}

export default App
