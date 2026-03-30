import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import './Leaderboard.css'

// Les jeux disponibles
const GAMES = [
    { id: 'snake', label: 'Snake', emoji: '🐍' },
    { id: 'breakout', label: 'Casse-briques', emoji: '🧱' },
    { id: 'memory', label: 'Mémory', emoji: '🃏' },
    { id: 'nasa-quiz', label: 'Quiz NASA', emoji: '🚀' },
    { id: 'food-guessr', label: 'FoodGuessr', emoji: '🍜' },
    { id: 'tower-defense', label: 'Tower Defense', emoji: '🏰' },
]

interface ScoreEntry {
    id: string
    score: number
    created_at: string
    profiles: {
        username: string
    }
}

function Leaderboard() {
    const { user, profile } = useAuth()
    const [activeGame, setActiveGame] = useState('snake')
    const [publicScores, setPublicScores] = useState<ScoreEntry[]>([])
    const [myScores, setMyScores] = useState<ScoreEntry[]>([])
    const [loading, setLoading] = useState(true)

    const loadPublicScores = async (game: string) => {
        const { data } = await supabase
            .from('scores')
            .select(`
                id,
                score,
                created_at,
                profiles (username)
            `)
            .eq('game', game)
            .order('score', { ascending: game === 'memory' })
            .limit(10)

        setPublicScores((data as unknown as ScoreEntry[]) ?? [])
    }

    const loadMyScores = async (game: string) => {
        if (!user) return

        const { data } = await supabase
            .from('scores')
            .select('id, score, created_at, profiles(username)')
            .eq('game', game)
            .eq('user_id', user.id)
            .order('score', { ascending: game === 'memory' })
            .limit(5)

        setMyScores((data as unknown as ScoreEntry[]) ?? [])
    }

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            await loadPublicScores(activeGame)
            await loadMyScores(activeGame)
            setLoading(false)
        }

        load()
    }, [activeGame, user])

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    const formatScore = (game: string, score: number) => {
        if (game === 'memory') return `${score} tentatives`
        if (game === 'nasa-quiz') return `${score} pts`
        if (game === 'food-guessr') return `${score} pts`
        return `${score} pts`
    }

    const activeGameData = GAMES.find((g) => g.id === activeGame)!

    return (
        <main className="page">
            <section className="leaderboard">
                <div className="leaderboard__header">
                    <h1 className="leaderboard__title">🏆 Classements</h1>
                    <p className="leaderboard__subtitle">
                        Les meilleurs scores de la communauté
                    </p>
                </div>

                <div className="leaderboard__tabs">
                    {GAMES.map((game) => (
                        <button
                            key={game.id}
                            className={`leaderboard__tab ${
                                activeGame === game.id ? 'leaderboard__tab--active' : ''
                            }`}
                            onClick={() => setActiveGame(game.id)}
                        >
                            {game.emoji} {game.label}
                        </button>
                    ))}
                </div>

                <div className="leaderboard__content">
                    <div className="leaderboard__section">
                        <h2 className="leaderboard__section-title">
                            Top 10 — {activeGameData.emoji} {activeGameData.label}
                        </h2>

                        {loading ? (
                            <p className="leaderboard__loading">Chargement...</p>
                        ) : publicScores.length === 0 ? (
                            <p className="leaderboard__empty">
                                Aucun score public pour l'instant — sois le premier ! 🎮
                            </p>
                        ) : (
                            <table className="leaderboard__table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Joueur</th>
                                        <th>Score</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {publicScores.map((entry, index) => (
                                        <tr
                                            key={entry.id}
                                            className={
                                                entry.profiles?.username === profile?.username
                                                    ? 'leaderboard__row--mine'
                                                    : ''
                                            }
                                        >
                                            <td className="leaderboard__rank">
                                                {index === 0
                                                    ? '🥇'
                                                    : index === 1
                                                    ? '🥈'
                                                    : index === 2
                                                    ? '🥉'
                                                    : `#${index + 1}`}
                                            </td>
                                            <td>{entry.profiles?.username ?? 'Anonyme'}</td>
                                            <td className="leaderboard__score">
                                                {formatScore(activeGame, entry.score)}
                                            </td>
                                            <td className="leaderboard__date">
                                                {formatDate(entry.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {user && (
                        <div className="leaderboard__section">
                            <h2 className="leaderboard__section-title">
                                Mes meilleurs scores
                            </h2>

                            {!profile?.share_scores && (
                                <p className="leaderboard__private-notice">
                                    🔒 Tes scores sont privés — tu n'apparais pas dans le classement public.
                                    Tu peux modifier ce choix depuis ton profil.
                                </p>
                            )}

                            {myScores.length === 0 ? (
                                <p className="leaderboard__empty">
                                    Tu n'as pas encore joué à ce jeu !
                                </p>
                            ) : (
                                <table className="leaderboard__table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Score</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myScores.map((entry, index) => (
                                            <tr key={entry.id}>
                                                <td className="leaderboard__rank">#{index + 1}</td>
                                                <td className="leaderboard__score">
                                                    {formatScore(activeGame, entry.score)}
                                                </td>
                                                <td className="leaderboard__date">
                                                    {formatDate(entry.created_at)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}

export default Leaderboard
