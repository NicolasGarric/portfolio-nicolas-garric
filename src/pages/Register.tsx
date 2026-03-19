import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Login.css'

function Register() {
    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [shareScores, setShareScores] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        // Vérifie que le username n'est pas déjà pris
        const { data: existing } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single()

        if (existing) {
            setError('Ce pseudo est déjà utilisé')
            setLoading(false)
            return
        }

        // Crée le compte — le trigger Supabase créera le profil automatiquement
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                username,
                share_scores: shareScores,
                },
            },
        })

        if (error) {
            setError(error.message)
        } else {
            navigate('/')
        }

        setLoading(false)
    }

    return (
        <main className="page">
            <section className="auth">

                <div className="auth__header">
                    <h1 className="auth__title">Inscription</h1>
                    <p className="auth__subtitle">
                        Crée ton compte pour sauvegarder tes scores
                    </p>
                </div>

                <form className="auth__form" onSubmit={handleSubmit}>

                <div className="form__group">
                    <label className="form__label" htmlFor="username">
                    Pseudo
                    </label>
                    <input
                    className="form__input"
                    type="text"
                    id="username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="TonPseudo"
                    required
                    minLength={3}
                    maxLength={20}
                    />
                </div>

                <div className="form__group">
                    <label className="form__label" htmlFor="email">
                    Email
                    </label>
                    <input
                    className="form__input"
                    type="email"
                    id="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ton@email.com"
                    required
                    />
                </div>

                <div className="form__group">
                    <label className="form__label" htmlFor="password">
                    Mot de passe
                    </label>
                    <input
                    className="form__input"
                    type="password"
                    id="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    />
                </div>

                {/* Choix de partage des scores */}
                <div className="form__group form__group--checkbox">
                    <input
                    type="checkbox"
                    id="shareScores"
                    className="form__checkbox"
                    checked={shareScores}
                    onChange={e => setShareScores(e.target.checked)}
                    />
                    <label htmlFor="shareScores" className="form__label--checkbox">
                    Partager mes scores dans les classements publics
                    </label>
                </div>

                <p className="auth__notice">
                    🔒 Tu pourras modifier ce choix depuis ton profil à tout moment
                </p>

                {error && <p className="form__error">❌ {error}</p>}

                <button
                    className="form__btn"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Création...' : 'Créer mon compte'}
                </button>

                <p className="auth__switch">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="auth__link">
                    Se connecter
                    </Link>
                </p>

                </form>
            </section>
        </main>
    )
}

export default Register
