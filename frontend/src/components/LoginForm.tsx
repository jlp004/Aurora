import '../styles/LoginForm.css'
import { useNavigate } from 'react-router-dom'
import { ReactNode } from 'react'
import { auth, provider, signInWithPopup } from '../services/firebase'

interface Props {
    children?: ReactNode
}

const LoginForm = ({children}: Props) => {
  const navigate = useNavigate();
  
  const handleClick = async () => {
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
    <button id="login-btn" className="btn btn-class-primary" onClick={handleClick}>Login</button>
  </>)
}

export default LoginForm