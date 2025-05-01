import { useNavigate } from "react-router"
import "../styles/HamburgerMenu.css"

/* Written by John Phelan - jlp220005
 * Handles the side drop down box and navigation to the pages inside it
 *
 * TODO:
 * This could probably perform better if the query selectors didn't have to be called for every handleCollapseIcon call,
 * But the way to implement that seems a lot more annoying and i don't understand it so I might come back to it
 */ 

const HamburgerMenu = () => {
    const navigate = useNavigate()

    const handleCollapseIcon = () => {
        const dash1 = document.querySelector("#dash1") as HTMLElement
        const dash2 = document.querySelector("#dash2") as HTMLElement
        const dash3 = document.querySelector("#dash3") as HTMLElement
        const navbar = document.querySelector(".dropdownmenu") as HTMLElement;
        const text = document.querySelector(".expandableText") as HTMLElement;


        /* The dashes animation is handled through pure CSS / rotations / transformations
         * It should be easier to render/manage than an animated image but it can break if
         * You change probably anything related to the dashes in HamburgerMenu.css
         */
        dash2.classList.toggle("hidden")
        dash1.classList.toggle("rotated")
        dash3.classList.toggle("rotatedOpposite")
        navbar.classList.toggle("navExpand")
        text.classList.toggle("visible")
    }

    return (
    <nav className="dropdownmenu">
        <div className="collapsible-container" onClick={handleCollapseIcon}>   
            <div className="dash" id="dash1" /> 
            <div className="dash" id="dash2" />
            <div className="dash" id="dash3" />
        </div>
        <div className="expandableText">
            <span 
                    onClick={() => navigate('/home')}     
                    style={{ color: 'black', fontWeight: 'bold', cursor: 'pointer' }}>
                    Home
            </span>
            <span 
                    onClick={() => navigate("/chats")}
                    style={{ color: 'black', fontWeight: 'bold', cursor: 'pointer' }}>
                    Chats
            </span>
            <span 
                    onClick={() => navigate("/account")}
                    style={{ color: 'black', fontWeight: 'bold', cursor: 'pointer' }}>
                    Account
            </span>
            <span 
                    onClick={() => navigate("/settings")}
                    style={{ color: 'black', fontWeight: 'bold', cursor: 'pointer' }}>
                    Settings
            </span>
            <span 
                    onClick={() => navigate("/leaderboard")}
                    style={{ color: 'black', fontWeight: 'bold', cursor: 'pointer' }}>
                    Leaderboard
            </span>
            <span 
                    onClick={() => navigate('/logout')}     //this makes sure the log out function is applied when clicked on the log out button
                    style={{ color: 'black', fontWeight: 'bold', cursor: 'pointer' }}>
                    Log Out
            </span>
            
        </div>
    </nav>
    )
}

export default HamburgerMenu