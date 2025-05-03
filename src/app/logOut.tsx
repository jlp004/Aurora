import { useEffect } from 'react';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

// Charitha

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        await signOut(auth); //signing out of the firebase authentication
        navigate('/Login'); //navigating back to the login page
        alert("Logged out successfully!") //alerts saying logged out
      } catch (error) {
        console.error("Logout failed:", error); //if theres an error everything inside catch is run
        alert("Logout failed.")
      }
    };

    logoutUser(); //when clicked on the button log out, the user is logged out and navigated back to the login page
  }, [navigate]);

  return (
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
       
      <h2>Log out of the account</h2> 
    </div>
  );
};

export default Logout; //exporting the logout function