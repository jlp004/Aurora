import { useEffect } from "react"
import "../styles/NavBar.css"

//You can redo or redesign this if u want i was just messing around with it
//it's also just poorly written bc there's a million query selectors lol

const NavBar = () => {
    const handleCollapseIcon = () => {
        const dash1 = document.querySelector("#dash1") as HTMLElement
        const dash2 = document.querySelector("#dash2") as HTMLElement
        const dash3 = document.querySelector("#dash3") as HTMLElement
        const navbar = document.querySelector(".navbar") as HTMLElement;

        dash2.classList.toggle("hidden")
        dash1.classList.toggle("rotated")
        dash3.classList.toggle("rotatedOpposite")
        navbar.classList.toggle("navExpandDown")
    }

    useEffect(() => {
        const dash1 = document.querySelector("#dash1") as HTMLElement
        const dash2 = document.querySelector("#dash2") as HTMLElement
        const dash3 = document.querySelector("#dash3") as HTMLElement
        const searchInput = document.querySelector(".search-bar") as HTMLElement;
        const navbar = document.querySelector(".navbar") as HTMLElement;
        

        if (searchInput && navbar) {
            const handleFocus = () => {
                console.log("Input focused")
                navbar.className = 'navbar navExpandRight'
                dash2.classList.remove("hidden")
                dash1.classList.remove("rotated")
                dash3.classList.remove("rotatedOpposite")
            }

            const handleBlur = () => {
                navbar.classList.remove("navExpandRight")
                
            }

            searchInput.addEventListener('focus', handleFocus)
            searchInput.addEventListener('blur', handleBlur)

            return () => {
                searchInput.removeEventListener('focus', handleFocus)
                searchInput.removeEventListener('blur', handleBlur)
            }
        }
    }, [])

    return (
    <nav className="navbar">
        <div className="collapsible-container" onClick={handleCollapseIcon}>
            <div className="dash" id="dash1" />
            <div className="dash" id="dash2" />
            <div className="dash" id="dash3" />
        </div>
        <div className="input-group mb-3">
            <input type="text" className="search-bar" placeholder="Search..." aria-label="Search..." aria-describedby="basic-addon1" />
        </div>
    </nav>
    )
}

export default NavBar