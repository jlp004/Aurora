import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'

import { ChakraProvider } from '@chakra-ui/react' // Will need 'npm i @chakra-ui/react@2 @emotion/react @emotion/styled framer-motion'
import { extendTheme } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'
import { BrowserRouter } from 'react-router-dom'
/** 
* Additional installation
* npm i @chakra-ui/react @emotion/react
* npm i react-icons react-router-dom
**/ 

// (Lydia)
// Set background theme (May not need this)
const styles = {
  global: (props: Record<string, any>) => ({
    body: {
      bg: mode("gray.100", "#000")(props),
      color: mode("gray.800", "whiteAlpha.900")(props),
    },
  }), 
};

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const theme = extendTheme({ config, styles })
// (Lydia)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter> 
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </BrowserRouter>
  </StrictMode>,
)
