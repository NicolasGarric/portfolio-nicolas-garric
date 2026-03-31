import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import './Home.css'

const sections = [
    {
        label: 'Jeux',
        description: 'Snake, Solitaire, Tower Defense et plus encore',
        emoji: '🎮',
        path: '/games',
    },
    {
        label: 'Sites réalisés',
        description: 'Projets clients développés en agence',
        emoji: '🌐',
        path: '/projects',
    },
    {
        label: 'Projets à venir',
        description: 'Ce qui arrive bientôt sur le portfolio',
        emoji: '🚀',
        path: '/upcoming',
    },
]

function Home() {
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
