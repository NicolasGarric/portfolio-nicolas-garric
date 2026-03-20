import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import './Profile.css'

const GAMES = [
    { id: 'snake', label: 'Snake', emoji: '🐍' },
    { id: 'breakout', label: 'Casse-briques', emoji: '🧱' },
    { id: 'memory', label: 'Mémory', emoji: '🃏' },
]

interface ScoreEntry {
    id: string
    score: number
    game: string
    created_at: string
}

function Profile() {
    const { user, profile, loading } = useAuth()
    const navigate = useNavigate()

    // Redirige si non connecté
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login')
        }
    }, [user, loading, navigate])

    const [shareScores, setShareScores] = useState(profile?.share_scores ?? false)
    const [saving, setSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [myScores, setMyScores] = useState<ScoreEntry[]>([])

    // Sync shareScores avec le profil chargé
    useEffect(() => {
        if (profile) {
            setShareScores(profile.share_scores)
        }
    }, [profile])

    // Charge tous mes scores
    useEffect(() => {
        if (!user) return

        const loadScores = async () => {
                const { data } = await supabase
                .from('scores')
                .select('id, score, game, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20)

            setMyScores(data ?? [])
        }

        loadScores()
    }, [user])

    // Met à jour le choix de partage
    const handleSave = async () => {
        if (!user) return
        setSaving(true)

        const { error } = await supabase
        .from('profiles')
        .update({ share_scores: shareScores })
        .eq('id', user.id)

        if (!error) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
        }

        setSaving(false)
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const formatScore = (game: string, score: number) => {
        if (game === 'memory') return `${score} tentatives`
        return `${score} pts`
    }

    const getGameLabel = (gameId: string) => {
        const game = GAMES.find(g => g.id === gameId)
        return game ? `${game.emoji} ${game.label}` : gameId
    }

    // Calcule le meilleur score par jeu
    const getBestScores = () => {
        const best: Record<string, number> = {}
        myScores.forEach(s => {
            if (s.game === 'memory') {
                // Pour memory, le meilleur = le moins de tentatives
                if (!best[s.game] || s.score < best[s.game]) {
                best[s.game] = s.score
                }
            } else {
                if (!best[s.game] || s.score > best[s.game]) {
                best[s.game] = s.score
                }
            }
        })
        return best
    }

    const bestScores = getBestScores()

    if (loading) {
        return (
        <main className="page">
            <p className="profile__loading">Chargement...</p>
        </main>
        )
    }

    return (
        <main className="page">
            <section className="profile">

                {/* En-tête profil */}
                <div className="profile__header">
                    <div className="profile__avatar">
                        {profile?.username?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="profile__info">
                        <h1 className="profile__username">{profile?.username}</h1>
                        <p className="profile__email">{user?.email}</p>
                    </div>
                </div>

                {/* Meilleurs scores */}
                <div className="profile__card">
                    <h2 className="profile__card-title">🏆 Mes meilleurs scores</h2>
                    <div className="profile__best-scores">
                        {GAMES.map(game => (
                            <div key={game.id} className="profile__best-score-item">
                                <span className="profile__best-score-game">
                                {game.emoji} {game.label}
                                </span>
                                <span className="profile__best-score-value">
                                {bestScores[game.id] !== undefined
                                    ? formatScore(game.id, bestScores[game.id])
                                    : 'Pas encore joué'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Paramètres de confidentialité */}
                <div className="profile__card">
                    <h2 className="profile__card-title">🔒 Confidentialité</h2>

                    <div className="profile__setting">
                        <div className="profile__setting-info">
                            <p className="profile__setting-label">
                                Partager mes scores publiquement
                            </p>
                            <p className="profile__setting-desc">
                                {shareScores
                                    ? '✅ Tes scores apparaissent dans le classement public'
                                    : '🔒 Tes scores sont privés et invisibles des autres'}
                            </p>
                        </div>
                        <label className="profile__toggle">
                        <input
                            type="checkbox"
                            checked={shareScores}
                            onChange={e => setShareScores(e.target.checked)}
                        />
                        <span className="profile__toggle-slider" />
                        </label>
                    </div>

                    {saveSuccess && (
                        <p className="profile__success">✅ Paramètres sauvegardés !</p>
                    )}

                    <button
                        className="profile__save-btn"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                </div>

                {/* Historique des parties */}
                <div className="profile__card">
                    <h2 className="profile__card-title">📋 Historique des parties</h2>

                    {myScores.length === 0 ? (
                        <p className="profile__empty">
                        Tu n'as pas encore joué — lance-toi ! 🎮
                        </p>
                    ) : (
                        <table className="profile__table">
                            <thead>
                                <tr>
                                <th>Jeu</th>
                                <th>Score</th>
                                <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myScores.map(entry => (
                                    <tr key={entry.id}>
                                        <td>{getGameLabel(entry.game)}</td>
                                        <td className="profile__table-score">
                                        {formatScore(entry.game, entry.score)}
                                        </td>
                                        <td className="profile__table-date">
                                        {formatDate(entry.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </section>
        </main>
    )
}

export default Profile
