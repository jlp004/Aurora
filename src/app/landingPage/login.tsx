import './landingStyles.css'
import {useNavigate} from 'react-router-dom'
import {ReactNode, useState} from 'react'
import {auth, provider, signInWithPopup} from '../../services/firebase'

// Charitha
// TODO: 'Create New Account' button currently is not implemented; 
// needs database implementation

const Login = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            // Send user input to backend API for account creation
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();

            if (res.ok) {
                // If the signup is successful, show a message and redirect to home page
                alert('logged in successfully!');
                navigate('/home');
            } else {
                alert(data.message || 'Failed to login');
            }
        } catch (err) {
            // Handle unexpected error
            console.error('login error', err);
            alert('Something went wrong.');
        }
    }
    /*
    const handleFirebaseAuth = async () => {   //firebase auth handler
        try {
            const result = await signInWithPopup(auth, provider)
            alert("Logged in successfully!")
            navigate("/home")
        } catch (error) {
            console.error("Login failed: ", error)
            alert("Login failed.")
        }
    }*/
//testing

    // return(
    // <>
    //   <button id="login-btn" className="btn btn-class-primary" onClick={handleFirebaseAuth}>Login</button>
    // </>)
    return (

        //Currently the formatting of the buttons is absolute and looks different based on the screen it's being run on, just an FYI!

        <div className="background">
            <header>
                <h1 style={{
                    display: "flex",
                    fontSize: "10rem",
                    fontWeight: "bold",
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    textAlign: "center",
                }}>
                    Aurora
                </h1>
            </header>

            <main style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}>
                <h1 className={"header"}>
                     Login to account
                </h1>
                {/* Signup form - username, email, password */}
                <form
                    className="accountForm"
                    onSubmit={handleLogin}
                >
                    <input
                        className="input"

                        id="username"
                        name="username"
                        type="username"

                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                    <input
                        className="input"

                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <input
                        className="input"

                        id="email"
                        name="email"
                        type="email"

                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        style={{
                            padding: '12px',
                            background: 'rgb(122, 50, 124)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'backgrounf 0.3 ease'
                        }}
                    >
                        Login
                    </button>
                    {/* Go back to Login page */}
                    <p style={{ marginTop: '10px', fontSize: '0.9rem', textAlign: "center" }}>
                        Don't have an account? {''}
                        <span
                            style={{ color: 'rgb(122, 50, 124)', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => navigate('/signup')}
                        >
                        Sign up
                    </span>
                    </p>
                </form>
            </main>

            {/*
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
            */}
        </div>
    );
}

export default Login //exporting it