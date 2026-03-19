import Hero from '../components/Hero'
import GameCard from '../components/GameCard'
import './Home.css'

// La liste des jeux
const games = [
    {
        title: 'Snake',
        description: 'Le classique jeu du serpent. Mange les pommes, évite les murs !',
        emoji: '🐍',
        path: '/games/snake',
        available: true,
    },
    {
        title: 'Casse-briques',
        description: 'Détruit tous les blocs avec ta balle et ta raquette.',
        emoji: '🧱',
        path: '/games/breakout',
        available: true,
    },
    {
        title: 'Mémory',
        description: 'Retrouve toutes les paires de cartes le plus vite possible.',
        emoji: '🃏',
        path: '/games/memory',
        available: true,
    },
]

function Home() {
    return (
        <main className="page">
            <Hero />

            {/* Section des jeux */}
            <section className="games" id="games">
                <h2 className="games__title">Les Jeux</h2>
                <p className="games__subtitle">
                    Tous les jeux sont développés en Rust et WebAssembly
                </p>

                {/* On "map" le tableau — pour chaque jeu on crée une GameCard */}
                <div className="games__grid">
                    {games.map((game) => (
                        <GameCard
                            key={game.title}
                            title={game.title}
                            description={game.description}
                            emoji={game.emoji}
                            path={game.path}
                            available={game.available}
                        />
                    ))}
                </div>
            </section>
        </main>
    )
}

export default Home
