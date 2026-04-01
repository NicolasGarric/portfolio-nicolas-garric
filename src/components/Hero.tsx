import { useTranslation } from 'react-i18next'
import './Hero.css'

function Hero() {
    const { t } = useTranslation()

    return (
        <section className="hero">

        {/* Badge au dessus du titre */}
        <span className="hero__badge">{t('hero.badge')}</span>

        {/* Titre principal */}
        <h1 className="hero__title">
            {t('hero.title')} <br />
            <span className="hero__name">Nicolas Garric</span>
        </h1>

        {/* Phrase d'accroche */}
        <p className="hero__subtitle">
            {t('hero.subtitle')}
        </p>

        {/* Boutons d'action */}
        <div className="hero__actions">
            <a href="/contact" className="hero__btn hero__btn--primary">
            {t('hero.cta_contact')}
            </a>
        </div>

        </section>
    )
}

export default Hero
