/* Written by Hishita Shah - HRS220004
   Written by Charitha Sarraju - CXS220054
*/

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SettingsPage.css';
import Header from '../components/Header';

const SettingsPage = () => {
  const [username, setUsername] = useState('user123!');
  const [bio, setBio] = useState('No bio yet');
  const [isPrivate, setIsPrivate] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  // Load user data (e.g., bio) from backend on page load
  useEffect(() => {
    const fetchBio = async () => {
      try {
        const res = await fetch(`/api/User/profile?username=${username}`);
        if (res.ok) {
          const data = await res.json();
          setBio(data.bio || 'No bio yet');
        } else {
          console.error('Failed to fetch bio');
        }
      } catch (err) {
        console.error('Error fetching bio:', err);
      }
    };

    fetchBio();
  }, [username]);

  // Save updated bio to backend
  const handleSave = async () => {
    try {
      const res = await fetch('/api/User/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, bio }),
      });

      if (res.ok) {
        alert('Settings saved!');
        console.log("Account details updated.");
      } else {
        const err = await res.json();
        alert("Failed to save: " + err.message);
      }
    } catch (err) {
      console.error("Error updating account details:", err);
      alert("Unexpected error occurred.");
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    try {
      await fetch('/api/User/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
    } catch (err) {
      console.error("Error during account deletion:", err);
    } finally {
      navigate('/login');
      console.log("Account deleted");
    }
  };

  return (
    <div className="settings-container">
      <Header />

      <h2 className="settings-title">Settings</h2>

      <div className="settings-section">
        <h3>Profile Settings</h3>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </label>
        <label>
          Bio:
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
          />
        </label>
      </div>

      <div className="settings-section">
        <h3>Privacy</h3>
        <label>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={() => setIsPrivate(!isPrivate)}
          />
          Private Account
        </label>
      </div>

      <div className="settings-section">
        <h3>Account Details</h3>
        <label>
          Change Email:
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter new email"
          />
        </label>
        <label>
          Change Password:
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter new password"
          />
        </label>
      </div>

      <button className="delete-button" onClick={handleDeleteAccount}>
        Delete Account
      </button>

      <button className="save-button" onClick={handleSave}>
        Save Changes
      </button>
    </div>
  );
};

export default SettingsPage;

