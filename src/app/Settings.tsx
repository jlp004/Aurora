/* Written by Hishita Shah - HRS220004

*/

import React, { useState } from 'react';
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

      <button className="save-button" onClick={handleSave}>
        Save Changes
      </button>

      <button className="logout-button">
        Log Out
      </button>
    </div>
  );
};

export default SettingsPage;
