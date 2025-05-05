/** Create Account Page - Lydia */

// Page is not complete, need backend database
import './landingStyles.css'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../../lib/api';
import { useUser } from '../userData';

const Signup = () => {
    // Track input values
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { setCurrentUser } = useUser();

    // Handles form submission
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Use the API utility to create a user
            const user = await createUser(username, email, password);
            
            // Save the new user to context
            setCurrentUser({
                id: user?.id || 'user_' + Date.now(), // Use the user ID from API or generate one
                username: username,
                email: email,
                pictureURL: user?.pictureURL || '', // Remove hardcoded profile pic
                profileDesc: user?.profileDesc || 'No bio yet' // Default bio
            });
            
            // the account was created successfully
            alert('Account Created');
            navigate('/home');
        } catch (err) {
            // Handle API errors 
            console.error('Signup error', err);
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert('Something went wrong.');
            }
        } finally {
            setIsLoading(false);
        }
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
                        textShadow: "0 2px 4px rgba(0,0,0,0.3)",
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
                {/* Header Title */}
                <h1 className={"header"}>
                    Create Your Account
                </h1>

                {/* Signup form - username, email, password */}
                <form
                    className="accountForm"
                    onSubmit={handleSignup}
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
                        Create Account
                    </button>
                    {/* Go back to Login page */}
                    <p style={{ marginTop: '10px', fontSize: '0.9rem', textAlign: "center", color: 'var(--text-primary)'}}>
                        Already have an account? {''}
                        <span
                            style={{ color: 'rgb(122, 50, 124)', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => navigate('/')}
                        >
                        Log in
                    </span>
                    </p>
                </form>
            </main>
        </div>
    );
};


export default Signup;