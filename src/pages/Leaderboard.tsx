import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import './Leaderboard.css'

const GAMES = [
    { id: 'solitaire', label: 'Solitaire', emoji: '🃏' },
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
    profiles: { username: string }
}

function Leaderboard() {
    const { t, i18n } = useTranslation()
    const { user, profile } = useAuth()
    const [activeGame, setActiveGame] = useState('snake')
    const [publicScores, setPublicScores] = useState<ScoreEntry[]>([])
    const [myScores, setMyScores] = useState<ScoreEntry[]>([])
    const [loading, setLoading] = useState(true)

    const loadPublicScores = async (game: string) => {
        const { data } = await supabase
            .from('scores')
            .select('id, score, created_at, profiles (username)')
            .eq('game', game)
            .order('score', { ascending: game === 'memory' || game === 'solitaire' })
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
            .order('score', { ascending: game === 'memory' || game === 'solitaire' })
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
        return new Date(dateStr).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    const formatScore = (game: string, score: number) => {
        if (game === 'memory') return `${score} tentatives`
        if (game === 'solitaire') return `${score} coups`
        return `${score} pts`
    }

    const activeGameData = GAMES.find(g => g.id === activeGame)!

    return (
        <main className="page">
            <section className="leaderboard">

                <div className="leaderboard__header">
                    <h1 className="leaderboard__title">{t('leaderboard.title')}</h1>
                    <p className="leaderboard__subtitle">
                        {t('leaderboard.subtitle')}
                    </p>
                </div>

                {/* Onglets */}
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
                                {t('leaderboard.empty')}
                            </p>
                        ) : (
                            <table className="leaderboard__table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>{t('leaderboard.player')}</th>
                                        <th>{t('leaderboard.score')}</th>
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
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Mes scores */}
                    {user && (
                        <div className="leaderboard__section">
                            <h2 className="leaderboard__section-title">
                                {t('leaderboard.my_scores')}
                            </h2>

                            {!profile?.share_scores && (
                                <p className="leaderboard__private-notice">
                                    {t('leaderboard.private')}
                                </p>
                            )}

                            {myScores.length === 0 ? (
                                <p className="leaderboard__empty">
                                    {t('profile.empty')}
                                </p>
                            ) : (
                                <table className="leaderboard__table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>{t('leaderboard.score')}</th>
                                            <th>{t('leaderboard.date')}</th>
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
