import { Link } from 'react-router-dom'
import './Header.css'

function Header() {
    return (
        <header className="header">
            {/* Le nom cliquable qui ramène à l'accueil */}
            <Link to="/" className="header__logo">
                Nicolas Garric
            </Link>

            {/* La navigation avec les liens */}
            <nav className="header__nav">
                <Link to="/" className="header__link">
                    Accueil
                </Link>
                <Link to="/contact" className="header__link">
                    Contact
                </Link>
            </nav>
        </header>
    )
}

export default Header
