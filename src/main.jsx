import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TunerProvider } from './context/TunerContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TunerProvider>
    <App />
    </TunerProvider>
    
  </StrictMode>,
)
