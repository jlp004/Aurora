import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'

/** Set Light/Dark Theme - Lydia Ma */
import { BrowserRouter } from 'react-router-dom'
/** 
* Additional installation
* npm i @chakra-ui/react@2 @emotion/react @emotion/styled framer-motion
* npm i @chakra-ui/react @emotion/react
* npm i react-icons react-router-dom
**/

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter> 
        <App />
    </BrowserRouter>
  </StrictMode>,
)
