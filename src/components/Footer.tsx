import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './Footer.css'

function Footer() {
    const { t } = useTranslation()
    const currentYear = new Date().getFullYear()

    return (
        <footer className="footer">

        <div className="footer__top">
            <Link to="/" className="footer__logo">
                Nicolas Garric
            </Link>

            <nav className="footer__nav">
            <Link to="/" className="footer__link">{t('nav.home')}</Link>
            <Link to="/contact" className="footer__link">{t('nav.contact')}</Link>
            </nav>
        </div>

        <div className="footer__divider" />

        <div className="footer__bottom">
            <p className="footer__copy">
                © {currentYear} Nicolas Garric — {t('footer.rights')}
            </p>
            <p className="footer__made">
                {t('footer.made')}
            </p>
        </div>

        </footer>
    )
}

export default Footer
