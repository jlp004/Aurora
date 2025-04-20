/* Written by Hishita Shah - HRS220004

*/

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SettingsPage.css';
import Header from '../components/Header';

const SettingsPage = () => {
  const [username, setUsername] = useState('user123!');
  const [bio, setBio] = useState('Lover of code and coffee ☕');
  const [isPrivate, setIsPrivate] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  const handleSave = () => {
    alert('Settings saved!');
  };
/////////////// - delete function
  const navigate = useNavigate();

const handleDeleteAccount = async () => {
  try {
    const res = await fetch('/api/user/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }) // Now has access to the state
    });

    if (res.ok) {
      alert("Account deleted successfully.");
      navigate('/login');
    } else {
      const error = await res.json();
      alert("Failed to delete account: " + error.message);
    }
  } catch (err) {
    console.error("Error:", err);
    alert("An unexpected error occurred.");
  }
}; //////////// - delete function


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
        <h3>Notifications</h3>
        <label>
          <input 
            type="checkbox" 
            checked={emailNotifs} 
            onChange={() => setEmailNotifs(!emailNotifs)} 
          />
          Email Notifications
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={pushNotifs} 
            onChange={() => setPushNotifs(!pushNotifs)} 
          />
          Push Notifications
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
