import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/index'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { Analytics } from '@vercel/analytics/react'

// Vérifie le consentement cookies au chargement
const cookieConsent = localStorage.getItem('cookie-consent')

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider>
            <App />
            {/* Analytics uniquement si l'utilisateur a accepté */}
            {cookieConsent === 'accepted' && <Analytics />}
        </AuthProvider>
    </StrictMode>,
)
