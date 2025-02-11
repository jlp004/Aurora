import '../styles/LoginForm.css'
import { ReactNode } from 'react'
// @ts-ignore
import { auth, provider, signInWithPopup } from '../services/firebase'

interface Props {
    children?: ReactNode
}

const handleClick = async () => {
    try {
        const result = await signInWithPopup(auth, provider)
        alert("Logged in successfully!")
    } catch (error) {
        console.error("Login failed: ", error)
        alert("Login failed.")
    }
}

const LoginForm = ({children}: Props) => {
  return( 
  <>
    <button id="login-btn" className="btn btn-class-primary" onClick={handleClick}>Login</button>
  </>)
}

export default LoginForm