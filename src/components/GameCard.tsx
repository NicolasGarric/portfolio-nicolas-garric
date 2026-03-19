import { Link } from 'react-router-dom'
import './GameCard.css'

// Props : ce sont les "paramètres" d'un composant
// Chaque GameCard reçoit des infos différentes via ses props
interface GameCardProps {
    title: string        // Le nom du jeu
    description: string  // La description courte
    emoji: string        // L'icône du jeu
    path: string         // L'URL vers le jeu ex: "/games/snake"
    available: boolean   // Le jeu est-il disponible ?
}

function GameCard({ title, description, emoji, path, available }: GameCardProps) {
    return (
        <div className={`card ${!available ? 'card--disabled' : ''}`}>

        {/* Badge "Bientôt disponible" si le jeu n'est pas prêt */}
        {!available && (
            <span className="card__badge">Bientôt disponible</span>
        )}

        {/* Icône du jeu */}
        <div className="card__emoji">{emoji}</div>

        {/* Infos du jeu */}
        <h2 className="card__title">{title}</h2>
        <p className="card__description">{description}</p>

        {/* Bouton — cliquable si disponible, grisé sinon */}
        {available ? (
            <Link to={path} className="card__btn">
            Jouer
            </Link>
        ) : (
            <span className="card__btn card__btn--disabled">
            Bientôt
            </span>
        )}

        </div>
    )
}

export default GameCard
