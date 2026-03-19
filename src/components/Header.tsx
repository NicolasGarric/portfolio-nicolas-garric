import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Header.css'

function Header() {
    const { user, profile, signOut } = useAuth()

    return (
        <header className="header">
        <Link to="/" className="header__logo">
            Nicolas Garric
        </Link>

        <nav className="header__nav">
            <Link to="/" className="header__link">Accueil</Link>
            <Link to="/contact" className="header__link">Contact</Link>
            <Link to="/leaderboard" className="header__link">🏆 Classements</Link>

            {user ? (
                // Utilisateur connecté
                <>
                    <Link to="/profile" className="header__link">
                    👤 {profile?.username}
                    </Link>
                    <button
                    className="header__btn header__btn--logout"
                    onClick={signOut}
                    >
                    Déconnexion
                    </button>
                </>
            ) : (
                // Utilisateur non connecté
                <>
                    <Link to="/login" className="header__link">Connexion</Link>
                    <Link to="/register" className="header__btn header__btn--register">
                    S'inscrire
                    </Link>
                </>
            )}
        </nav>
        </header>
    )
}

export default Header
