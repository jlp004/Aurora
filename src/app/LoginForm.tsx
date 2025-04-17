import '../styles/LoginForm.css'
import {useNavigate} from 'react-router-dom'
import {ReactNode} from 'react'
import {auth, provider, signInWithPopup} from '../services/firebase'

// Charitha

// TODO: 'Create New Account' button currently is not implemented; 
// needs database implementation

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
//testing


    // return(
    // <>
    //   <button id="login-btn" className="btn btn-class-primary" onClick={handleFirebaseAuth}>Login</button>
    // </>)
    return (

        //Currently the formatting of the buttons is absolute and looks different based on the screen it's being run on, just an FYI!

        <div style={{ //this is for the background, to create the gradiant effect to make it look like northern lights/gradient looking
            background: 'linear-gradient(135deg,rgb(26, 22, 78) 0%,rgb(122, 50, 124) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            height: '100vh', //having the height and weight for the page, as well as the alignment
            width: '100vw',
            alignItems: 'center'
        }}>

            <h1 style={{ //this is for the text box saying the web app name "Aurora"
                display: 'flex',
                marginBottom: '300px', //aligning it as wanted
                fontSize: '6rem', //increased font size for the app name effect, below are just some texxt formatting stuff
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                textAlign: 'center',
                fontWeight: 'bold',
            }}>
                Aurora
            </h1>

            <button //this button helps you login using your google account
                id="login-btn"
                className="btn btn-class-primary"
                onClick={handleFirebaseAuth} //using firebase for the google account login

                style={{
                    position: 'absolute',
                    top: '300px',
                    width: '200px', // Wider button
                    padding: '12px 0', // Adjusted padding for width
                }}
            >
                Login
            </button>

            <button //this button is for the create account page
                id="createAccount-btn"
                className="btn btn-create-Account"
                onClick={() => navigate('/signup')}
                style={{
                    position: 'absolute', //formatting the position of the button to align it with the login button
                    top: '360px',
                    width: '200px', // Wider button
                    padding: '12px 0' // Adjusted padding for width
                }}
            >
                Create Account
            </button>
        </div>
    );
}

export default LoginForm //exporting it