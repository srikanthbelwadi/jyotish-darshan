import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { PreferencesProvider } from './contexts/PreferencesContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PreferencesProvider>
      <App />
    </PreferencesProvider>
  </StrictMode>,
)
