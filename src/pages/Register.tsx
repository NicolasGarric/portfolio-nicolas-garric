import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import './Login.css'

function Register() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [shareScores, setShareScores] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault()
        setError('')
        setLoading(true)

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
                    <h1 className="auth__title">{t('auth.register.title')}</h1>
                    <p className="auth__subtitle">
                        {t('auth.register.subtitle')}
                    </p>
                </div>

                <form className="auth__form" onSubmit={handleSubmit}>

                <div className="form__group">
                    <label className="form__label" htmlFor="username">
                        {t('auth.register.username')}
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
                    minLength={6}
                    />
                </div>

                <div className="form__group form__group--checkbox">
                    <input
                    type="checkbox"
                    id="shareScores"
                    className="form__checkbox"
                    checked={shareScores}
                    onChange={e => setShareScores(e.target.checked)}
                    />
                    <label htmlFor="shareScores" className="form__label--checkbox">
                        {t('auth.register.share')}
                    </label>
                </div>

                <p className="auth__notice">
                    {t('auth.register.notice')}
                </p>

                {error && <p className="form__error">❌ {error}</p>}

                <button
                    className="form__btn"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? t('auth.register.loading') : t('auth.register.btn')}
                </button>

                <p className="auth__switch">
                    {t('auth.register.has_account')}{' '}
                    <Link to="/login" className="auth__link">
                        {t('auth.register.login')}
                    </Link>
                </p>

                </form>
            </section>
        </main>
    )
}

export default Register
