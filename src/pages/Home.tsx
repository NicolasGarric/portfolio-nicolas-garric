import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Hero from '../components/Hero'
import './Home.css'

function Home() {
    const { t } = useTranslation()

    const sections = [
        {
            label: t('nav.games'),
            description: t('home.games_desc'),
            emoji: '🎮',
            path: '/games',
        },
        {
            label: t('nav.projects'),
            description: t('home.projects_desc'),
            emoji: '🌐',
            path: '/projects',
        },
        {
            label: t('nav.upcoming'),
            description: t('home.upcoming_desc'),
            emoji: '🚀',
            path: '/upcoming',
        },
    ]

    return (
        <main className="page">
            <Hero />

            <section className="home-nav">
                <div className="home-nav__grid">
                    {sections.map((section) => (
                        <Link key={section.path} to={section.path} className="home-nav__card">
                            <span className="home-nav__emoji">{section.emoji}</span>
                            <h2 className="home-nav__label">{section.label}</h2>
                            <p className="home-nav__description">{section.description}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    )
}

export default Home
