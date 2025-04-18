/** Create Account Page - Lydia */

// Page is not complete, need backend database
import './landingStyles.css'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    // Track input values
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // Handles form submission
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Send user input to backend API for account creation
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();

            if (res.ok) {
                // If the signup is successful, show a message and redirect to home page
                alert('Account Created');
                navigate('/');
            } else {
                alert(data.message || 'Failed to Create Account');
            }
        } catch (err) {
            // Handle unexpected error
            console.error('Signup error', err);
            alert('Something went wrong.');
        }
    };

    return ( 
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
                            color: 'white',
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
                    <p style={{ marginTop: '10px', fontSize: '0.9rem', textAlign: "center" }}>
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