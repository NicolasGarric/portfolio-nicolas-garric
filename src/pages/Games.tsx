import GameCard from '../components/GameCard'
import './Games.css'

const games = [
    {
        title: 'Solitaire',
        description: 'Le classique jeu de cartes Klondike — classe toutes les cartes !',
        emoji: '🃏',
        path: '/games/solitaire',
        available: true,
    },
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
        description: "Découvre des vraies photos de l'espace et teste tes connaissances !",
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
        description: "Place des tourelles et défends ta base contre les vagues d'ennemis !",
        emoji: '🏰',
        path: '/games/tower-defense',
        available: true,
    },
]

function Games() {
    return (
        <main className="page">
            <section className="games-page">
                <div className="games-page__header">
                    <h1 className="games-page__title">Les Jeux</h1>
                    <p className="games-page__subtitle">
                        Tous les jeux sont développés en React et TypeScript
                    </p>
                </div>

                <div className="games-page__grid">
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

export default Games
