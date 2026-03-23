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

    // Charge les scores publics du jeu sélectionné
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
        // Pour Memory, moins de tentatives = meilleur score
        // Pour les autres, plus de points = meilleur score
        .limit(10)

        // Filtre côté client pour n'afficher que les scores publics
        // Le RLS Supabase filtre déjà, mais on s'assure ici
        setPublicScores((data as unknown as ScoreEntry[]) ?? [])
    }

    // Charge mes scores personnels
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

    // Formate la date en français
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    // Formate le score selon le jeu
    const formatScore = (game: string, score: number) => {
        if (game === 'memory') return `${score} tentatives`
        if (game === 'nasa-quiz') return `${score} pts`
        return `${score} pts`
    }

    const activeGameData = GAMES.find(g => g.id === activeGame)!

    return (
        <main className="page">
            <section className="leaderboard">

                <div className="leaderboard__header">
                    <h1 className="leaderboard__title">🏆 Classements</h1>
                    <p className="leaderboard__subtitle">
                        Les meilleurs scores de la communauté
                    </p>
                </div>

                {/* Onglets des jeux */}
                <div className="leaderboard__tabs">
                {GAMES.map(game => (
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

                {/* Classement public */}
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
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
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

                {/* Mes scores personnels */}
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
