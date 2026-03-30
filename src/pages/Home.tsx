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
    {
        title: 'Quiz NASA',
        description: 'Découvre des vraies photos de l\'espace et teste tes connaissances !',
        emoji: '🚀',
        path: '/games/nasa-quiz',
        available: true,
    },
    {
        title: 'FoodGuessr',
        description: 'Devine de quel pays vient ce plat et marque le sur la carte !',
        emoji: '🍜',
        path: '/games/food-guessr',
        available: true,
    },
    {
        title: 'Tower Defense',
        description: 'Place des tourelles et défends ta base contre les vagues d\'ennemis !',
        emoji: '🏰',
        path: '/games/tower-defense',
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
