import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="footer">

        {/* Partie haute — nom + navigation */}
        <div className="footer__top">
            <Link to="/" className="footer__logo">
                Nicolas Garric
            </Link>

            <nav className="footer__nav">
            <Link to="/" className="footer__link">Accueil</Link>
            <Link to="/contact" className="footer__link">Contact</Link>
            </nav>
        </div>

        {/* Séparateur */}
        <div className="footer__divider" />

        {/* Partie basse — copyright */}
        <div className="footer__bottom">
            <p className="footer__copy">
                © {currentYear} Nicolas Garric — Tous droits réservés
            </p>
            <p className="footer__made">
                Fait avec React & Rust 🦀
            </p>
        </div>

        </footer>
    )
}

export default Footer
