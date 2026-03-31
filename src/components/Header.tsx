import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Header.css'

function Header() {
    const { user, profile, signOut } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)

    const closeMenu = () => setMenuOpen(false)

    return (
        <header className="header">
            <Link to="/" className="header__logo">
                Nicolas Garric
            </Link>

            {/* Nav desktop */}
            <nav className="header__nav">
                <Link to="/" className="header__link">Accueil</Link>
                <Link to="/contact" className="header__link">Contact</Link>
                <Link to="/leaderboard" className="header__link">🏆 Classements</Link>

                {user ? (
                    <>
                        <Link to="/profile" className="header__link">
                            👤 {profile?.username}
                        </Link>
                        <button className="header__btn header__btn--logout" onClick={signOut}>
                            Déconnexion
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="header__link">Connexion</Link>
                        <Link to="/register" className="header__btn header__btn--register">
                            S'inscrire
                        </Link>
                    </>
                )}
            </nav>

            {/* Bouton hamburger — mobile uniquement */}
            <button
                className="header__burger"
                onClick={() => setMenuOpen(true)}
                aria-label="Ouvrir le menu"
            >
                ☰
            </button>

            {/* Overlay + modal mobile */}
            {menuOpen && (
                <div className="header__overlay" onClick={closeMenu}>
                    <nav className="header__modal" onClick={e => e.stopPropagation()}>
                        <button className="header__modal-close" onClick={closeMenu} aria-label="Fermer">
                            ✕
                        </button>

                        <Link to="/" className="header__modal-link" onClick={closeMenu}>Accueil</Link>
                        <Link to="/contact" className="header__modal-link" onClick={closeMenu}>Contact</Link>
                        <Link to="/leaderboard" className="header__modal-link" onClick={closeMenu}>🏆 Classements</Link>

                        {user ? (
                            <>
                                <Link to="/profile" className="header__modal-link" onClick={closeMenu}>
                                    👤 {profile?.username}
                                </Link>
                                <button
                                    className="header__modal-link header__modal-link--logout"
                                    onClick={() => { signOut(); closeMenu() }}
                                >
                                    Déconnexion
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="header__modal-link" onClick={closeMenu}>
                                    Connexion
                                </Link>
                                <Link
                                    to="/register"
                                    className="header__modal-link header__modal-link--register"
                                    onClick={closeMenu}
                                >
                                    S'inscrire
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            )}
        </header>
    )
}

export default Header
