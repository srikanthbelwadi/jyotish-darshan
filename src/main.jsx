import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { PreferencesProvider } from './contexts/PreferencesContext.jsx'
import { SyncProvider } from './contexts/SyncContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PreferencesProvider>
      <SyncProvider>
        <App />
      </SyncProvider>
    </PreferencesProvider>
  </StrictMode>,
)
