import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import './Header.css'

function Header() {
    const { user, profile, signOut } = useAuth()
    const { t, i18n } = useTranslation()
    const [menuOpen, setMenuOpen] = useState(false)

    const closeMenu = () => setMenuOpen(false)

    const toggleLanguage = () => {
        const newLang = i18n.language === 'fr' ? 'en' : 'fr'
        i18n.changeLanguage(newLang)
        localStorage.setItem('language', newLang)
    }

    return (
        <>
        <header className="header">
            <Link to="/" className="header__logo">
                Nicolas Garric
            </Link>

            {/* Nav desktop */}
            <nav className="header__nav">
                <Link to="/" className="header__link">{t('nav.home')}</Link>
                <Link to="/projects" className="header__link">{t('nav.projects')}</Link>
                <Link to="/upcoming" className="header__link">{t('nav.upcoming')}</Link>
                <Link to="/games" className="header__link">{t('nav.games')}</Link>
                <Link to="/contact" className="header__link">{t('nav.contact')}</Link>
                <Link to="/leaderboard" className="header__link">🏆 {t('nav.leaderboard')}</Link>

                {user ? (
                    <>
                        <Link to="/profile" className="header__link">
                            👤 {profile?.username}
                        </Link>
                        <button className="header__btn header__btn--logout" onClick={signOut}>
                            {t('nav.logout')}
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="header__link">{t('nav.login')}</Link>
                        <Link to="/register" className="header__btn header__btn--register">
                            {t('nav.register')}
                        </Link>
                    </>
                )}

                <button className="header__lang" onClick={toggleLanguage}>
                    {i18n.language === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
                </button>
            </nav>

            {/* Bouton hamburger — mobile uniquement */}
            <button
                className="header__burger"
                onClick={() => setMenuOpen(true)}
                aria-label="Ouvrir le menu"
            >
                ☰
            </button>

        </header>

            {/* Overlay + modal mobile — portail hors du header pour éviter les conflits de z-index */}
            {menuOpen && createPortal(
                <div className="header__overlay" onClick={closeMenu}>
                    <nav className="header__modal" onClick={e => e.stopPropagation()}>
                        <button className="header__modal-close" onClick={closeMenu} aria-label="Fermer">
                            ✕
                        </button>

                        <Link to="/" className="header__modal-link" onClick={closeMenu}>{t('nav.home')}</Link>
                        <Link to="/projects" className="header__modal-link" onClick={closeMenu}>{t('nav.projects')}</Link>
                        <Link to="/upcoming" className="header__modal-link" onClick={closeMenu}>{t('nav.upcoming')}</Link>
                        <Link to="/games" className="header__modal-link" onClick={closeMenu}>{t('nav.games')}</Link>
                        <Link to="/contact" className="header__modal-link" onClick={closeMenu}>{t('nav.contact')}</Link>
                        <Link to="/leaderboard" className="header__modal-link" onClick={closeMenu}>🏆 {t('nav.leaderboard')}</Link>

                        {user ? (
                            <>
                                <Link to="/profile" className="header__modal-link" onClick={closeMenu}>
                                    👤 {profile?.username}
                                </Link>
                                <button
                                    className="header__modal-link header__modal-link--logout"
                                    onClick={() => { signOut(); closeMenu() }}
                                >
                                    {t('nav.logout')}
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="header__modal-link" onClick={closeMenu}>
                                    {t('nav.login')}
                                </Link>
                                <Link
                                    to="/register"
                                    className="header__modal-link header__modal-link--register"
                                    onClick={closeMenu}
                                >
                                    {t('nav.register')}
                                </Link>
                            </>
                        )}

                        <button className="header__lang header__lang--mobile" onClick={toggleLanguage}>
                            {i18n.language === 'fr' ? '🇬🇧 English' : '🇫🇷 Français'}
                        </button>
                    </nav>
                </div>,
                document.body
            )}
        </>
    )
}

export default Header
