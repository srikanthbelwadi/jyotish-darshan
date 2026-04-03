import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { PreferencesProvider } from './contexts/PreferencesContext.jsx'
import { SyncProvider } from './contexts/SyncContext.jsx'
import { Analytics } from '@vercel/analytics/react'
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
        <Suspense fallback={<div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F172A', color: '#FFF'}}>Loading Jyotish Darshan Shastric Dictionaries...</div>}>
          <App />
          <Analytics />
        </Suspense>
      </SyncProvider>
    </PreferencesProvider>
    </QueryClientProvider>
  </StrictMode>,
)
