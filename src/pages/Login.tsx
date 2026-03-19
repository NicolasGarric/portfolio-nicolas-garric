import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Login.css'

function Login() {
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError('Email ou mot de passe incorrect')
        } else {
            navigate('/')
        }

        setLoading(false)
    }

    return (
        <main className="page">
        <section className="auth">

            <div className="auth__header">
                <h1 className="auth__title">Connexion</h1>
                <p className="auth__subtitle">
                    Connecte-toi pour sauvegarder tes scores
                </p>
            </div>

            <form className="auth__form" onSubmit={handleSubmit}>

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
                />
            </div>

            {error && <p className="form__error">❌ {error}</p>}

            <button
                className="form__btn"
                type="submit"
                disabled={loading}
            >
                {loading ? 'Connexion...' : 'Se connecter'}
            </button>

            <p className="auth__switch">
                Pas encore de compte ?{' '}
                <Link to="/register" className="auth__link">
                S'inscrire
                </Link>
            </p>

            </form>
        </section>
        </main>
    )
}

export default Login
