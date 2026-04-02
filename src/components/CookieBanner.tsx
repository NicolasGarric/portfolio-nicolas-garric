import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './CookieBanner.css'

function CookieBanner() {
    const { i18n } = useTranslation()
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        // Vérifie si l'utilisateur a déjà fait son choix
        const consent = localStorage.getItem('cookie-consent')
        if (!consent) {
            // Affiche la bannière après 1 seconde
            const timer = setTimeout(() => setVisible(true), 1000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted')
        setVisible(false)
        // Recharge pour activer Analytics
        window.location.reload()
    }

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'declined')
        setVisible(false)
    }

    if (!visible) return null

    const isFr = i18n.language === 'fr'

    return (
        <div className="cookie-banner">
            <div className="cookie-banner__content">
                <p className="cookie-banner__text">
                    {isFr
                        ? '🍪 Ce site utilise des cookies pour améliorer votre expérience et analyser le trafic.'
                        : '🍪 This site uses cookies to improve your experience and analyze traffic.'
                    }
                    {' '}
                    <a
                        href="https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cookie-banner__link"
                    >
                        {isFr ? 'En savoir plus' : 'Learn more'}
                    </a>
                </p>

                <div className="cookie-banner__actions">
                    <button
                        className="cookie-banner__btn cookie-banner__btn--decline"
                        onClick={handleDecline}
                    >
                        {isFr ? 'Refuser' : 'Decline'}
                    </button>
                    <button
                        className="cookie-banner__btn cookie-banner__btn--accept"
                        onClick={handleAccept}
                    >
                        {isFr ? 'Accepter' : 'Accept'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CookieBanner
