import './Hero.css'

function Hero() {
    return (
        <section className="hero">

        {/* Badge au dessus du titre */}
        <span className="hero__badge">Développeur Web & Jeux</span>

        {/* Titre principal */}
        <h1 className="hero__title">
            Bonjour, je suis <br />
            <span className="hero__name">Nicolas Garric</span>
        </h1>

        {/* Phrase d'accroche */}
        <p className="hero__subtitle">
            Je crée des expériences web interactives et des jeux
            jouables directement dans ton navigateur.
        </p>

        {/* Boutons d'action */}
        <div className="hero__actions">
            <a href="#games" className="hero__btn hero__btn--primary">
            Voir les jeux
            </a>
            <a href="/contact" className="hero__btn hero__btn--secondary">
            Me contacter
            </a>
        </div>

        </section>
    )
}

export default Hero
