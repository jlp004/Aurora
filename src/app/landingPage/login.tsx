import './landingStyles.css'
import {useNavigate} from 'react-router-dom'
import {ReactNode, useState} from 'react'
import {auth, provider, signInWithPopup} from '../../services/firebase'
import { loginUser } from '../../lib/api'
import { useUser } from '../userData'

// Charitha

const Login = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { setCurrentUser } = useUser();
    
    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            // Use the API utility to log in
            const response = await loginUser(username, password);
            
            console.log('Login successful:', response);
            
            // Fetch the complete user data from the database
            const userResponse = await fetch(`/api/User/username/${username}`);
            if (!userResponse.ok) {
                throw new Error('Failed to fetch user data');
            }
            
            const userData = await userResponse.json();
            const user = userData.users[0];
            
            // Save the complete user data including ID to context
            setCurrentUser({
                id: user?.id || 'user_' + Date.now(),
                username: user?.username || username,
                email: user?.email || email,
                pictureURL: user?.pictureURL || '/images/profile-pic.jpg',
                profileDesc: user?.profileDesc // Don't use default bio here
            });
            
            // Store to localStorage happens in the UserProvider
            
            alert('Logged in successfully!');
            navigate('/home');
        } catch (err) {
            console.error('Login error:', err);
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert('Something went wrong during login.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleQuickLogin = () => {
        // Set a mock user with unique ID
        setCurrentUser({
            id: 'user_' + Date.now(), // Generate a unique ID
            username: username || 'demo_user',
            email: email || 'demo@example.com',
            pictureURL: '/images/profile-pic.jpg',
            profileDesc: 'No bio yet' // Default bio
        });
        
        navigate('/home');
    };
    
    return (
        <div className="background">
            <header>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "100%"
                }}>
                    <img 
                        src="/images/logo.png" 
                        alt="Aurora Logo" 
                        style={{
                            width: '150px',
                            height: 'auto',
                            marginBottom: '20px'
                        }}
                    />
                    <h1 style={{
                        fontSize: "6rem",
                        fontWeight: "bold",
                        textShadow: "0 2px 4px var(--dropdown-shadow)",
                        textAlign: "center",
                        margin: 0
                    }}>
                        Aurora
                    </h1>
                </div>
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
                            color: '#dcdcdc',
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
                    <p style={{ marginTop: '10px', fontSize: '0.9rem', textAlign: "center", color: 'var(--text-primary)' }}>
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

            {/** Go to Home Button (This will be removed later once login and create account work) */}
            <button
                onClick={() => navigate('/home')}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    padding: '12px 20px',
                    background: 'rgb(122, 50, 124)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    zIndex: 1000
                }}
            >
                Go to Home
            </button>

            
        </div>
    );
}

export default Login 