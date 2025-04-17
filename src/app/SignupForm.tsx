/** Create Account Page - Lydia */

// Page is not complete, need backend database
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignupForm = () => {
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
                navigate('/home');
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
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            background: 'linear-gradient(135deg,rgb(26, 22, 78) 0%,rgb(122, 50, 124) 100%)',
            position: 'relative',
            fontFamily: 'Arial, sans-serif',
        }}>
            {/* Header Title */}
            <h2 style={{ color: 'white', marginBottom: '30px', fontSize: '2.5rem' }}>
                Create Your Account
            </h2>

            {/* Signup form - username, email, password */}
            <form
                onSubmit={handleSignup}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    background: 'white',
                    padding: '40px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    minWidth: '300px'
                }}
            >
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    style={inputStyle}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={inputStyle}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={inputStyle}
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
                <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>
                    Already have an account? {''}
                    <span
                        style={{ color: 'rgb(122, 50, 124)', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => navigate('/')}
                    >
                        Log in
                    </span>
                </p>
            </form>
        </div>
    );
};

const inputStyle = {
    padding: '12px',
    fontSize: '1rem',
    borderRadius: '6px',
    border: '1px solid #ccc'
};

export default SignupForm;