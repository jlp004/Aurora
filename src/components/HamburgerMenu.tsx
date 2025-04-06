import { useNavigate } from "react-router"
import "../styles/HamburgerMenu.css"

// Written by John Phelan - jlp220005
// Handles the side drop down box and navigation to the pages inside it

const DropDownMenu = () => {
    const navigate = useNavigate()

    const handleCollapseIcon = () => {
        const dash1 = document.querySelector("#dash1") as HTMLElement
        const dash2 = document.querySelector("#dash2") as HTMLElement
        const dash3 = document.querySelector("#dash3") as HTMLElement
        const navbar = document.querySelector(".dropdownmenu") as HTMLElement;
        const text = document.querySelector(".expandableText") as HTMLElement;

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
                    onClick={() => navigate('/logout')}     //this makes sure the log out function is applied when clicked on the log out button
                    style={{ color: 'black', fontWeight: 'bold', cursor: 'pointer' }}>
                    Log Out
            </span>
        </div>
    </nav>
    )
}

export default DropDownMenu