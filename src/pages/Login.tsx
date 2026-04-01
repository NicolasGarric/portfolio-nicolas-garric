import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import './Login.css'

function Login() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(t('auth.login.error'))
        } else {
            navigate('/')
        }

        setLoading(false)
    }

    return (
        <main className="page">
        <section className="auth">

            <div className="auth__header">
                <h1 className="auth__title">{t('auth.login.title')}</h1>
                <p className="auth__subtitle">
                    {t('auth.login.subtitle')}
                </p>
            </div>

            <form className="auth__form" onSubmit={handleSubmit}>

            <div className="form__group">
                <label className="form__label" htmlFor="email">
                    {t('contact.email')}
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
                {loading ? t('auth.login.loading') : t('auth.login.btn')}
            </button>

            <p className="auth__switch">
                {t('auth.login.no_account')}{' '}
                <Link to="/register" className="auth__link">
                    {t('auth.login.register')}
                </Link>
            </p>

            </form>
        </section>
        </main>
    )
}

export default Login
