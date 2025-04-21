/* Written by Hishita Shah - HRS220004
written by Charitha Sarraju - CXS220054

*/

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SettingsPage.css';
import Header from '../components/Header';
import { useUser } from './userData';

const SettingsPage = () => {
  const { currentUser, setCurrentUser } = useUser();
  const [username, setUsername] = useState(currentUser?.username || 'user123!');
  const [bio, setBio] = useState(currentUser?.profileDesc || 'Lover of code and coffee ☕');
  const [isPrivate, setIsPrivate] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  // Update form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || username);
      setBio(currentUser.profileDesc || bio);
    }
  }, [currentUser]);

  const handleSave = () => {
    // Update the user context with new values
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        username: username,
        profileDesc: bio
      };
      
      // Update user context (this will be stored in localStorage)
      setCurrentUser(updatedUser);
      
      // Try to update the backend if available
      try {
        fetch('/api/user/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: currentUser.id,
            username,
            bio
          })
        }).catch(err => console.error('API error:', err));
      } catch (err) {
        console.error('Error updating user:', err);
      }
    }
    
    alert('Settings saved!');
  };

  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    try {
      await fetch('/api/User/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username })
      });
      
    } catch (err) {
      console.error("Error during account deletion:", err);
    } finally {
      // Clear user from context
      setCurrentUser(null);
      
      // Navigate away regardless of success/failure
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
