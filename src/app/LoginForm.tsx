import '../styles/LoginForm.css'
import { useNavigate } from 'react-router-dom'
import { ReactNode } from 'react'
import { auth, provider, signInWithPopup } from '../services/firebase'

const LoginForm = () => {
  const navigate = useNavigate();
  
  const handleFirebaseAuth = async () => {   //firebase auth handler
    try {
        const result = await signInWithPopup(auth, provider)
        alert("Logged in successfully!")
        navigate("/home")
    } catch (error) {
        console.error("Login failed: ", error)
        alert("Login failed.")
    }
  }


  return( 
  <>
    <button id="login-btn" className="btn btn-class-primary" onClick={handleFirebaseAuth}>Login</button>
  </>)
}

export default LoginForm