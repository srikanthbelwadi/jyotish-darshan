import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { PreferencesProvider } from './contexts/PreferencesContext.jsx'
import { SyncProvider } from './contexts/SyncContext.jsx'
import './i18n/index.js'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24 hours caching for Oracle/Pathway checks
      refetchOnWindowFocus: false,
      retry: 1
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
    <PreferencesProvider>
      <SyncProvider>
        <App />
      </SyncProvider>
    </PreferencesProvider>
    </QueryClientProvider>
  </StrictMode>,
)
