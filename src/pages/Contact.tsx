import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import emailjs from 'emailjs-com'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import './Contact.css'

interface FormData {
    from_name: string
    from_email: string
    message: string
}

function Contact() {
    const { t } = useTranslation()

    const [formData, setFormData] = useState<FormData>({
        from_name: '',
        from_email: '',
        message: '',
    })

    const [captchaToken, setCaptchaToken] = useState<string | null>(null)
    const [isSending, setIsSending] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState(false)
    const captchaRef = useRef<HCaptcha>(null)

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleCaptcha = (token: string) => {
        setCaptchaToken(token)
    }

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault()

        if (!captchaToken) {
            setError(true)
            return
        }

        setIsSending(true)
        setError(false)

        try {
            await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                { ...formData },
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            )

            setSuccess(true)
            setFormData({ from_name: '', from_email: '', message: '' })
            setCaptchaToken(null)
            captchaRef.current?.resetCaptcha()

        } catch (err) {
            setError(true)
        } finally {
            setIsSending(false)
        }
    }

    return (
        <main className="page">
            <section className="contact">

                <div className="contact__header">
                    <h1 className="contact__title">{t('contact.title')}</h1>
                    <p className="contact__subtitle">
                        {t('contact.subtitle')}
                    </p>
                </div>

                <form className="contact__form" onSubmit={handleSubmit}>

                <div className="form__group">
                    <label className="form__label" htmlFor="from_name">
                        {t('contact.name')}
                    </label>
                    <input
                        className="form__input"
                        type="text"
                        id="from_name"
                        name="from_name"
                        value={formData.from_name}
                        onChange={handleChange}
                        placeholder={t('contact.placeholder.name')}
                        required
                    />
                </div>

                <div className="form__group">
                    <label className="form__label" htmlFor="from_email">
                        {t('contact.email')}
                    </label>
                    <input
                        className="form__input"
                        type="email"
                        id="from_email"
                        name="from_email"
                        value={formData.from_email}
                        onChange={handleChange}
                        placeholder="ton@email.com"
                        required
                    />
                </div>

                <div className="form__group">
                    <label className="form__label" htmlFor="message">
                        {t('contact.message')}
                    </label>
                    <textarea
                        className="form__textarea"
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder={t('contact.placeholder.message')}
                        rows={6}
                        required
                    />
                </div>

                <div className="form__captcha">
                    <HCaptcha
                        sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY}
                        onVerify={handleCaptcha}
                        ref={captchaRef}
                        theme="dark"
                    />
                </div>

                {success && (
                    <p className="form__success">{t('contact.success')}</p>
                )}
                {error && (
                    <p className="form__error">{t('contact.error')}</p>
                )}

                <button
                    className="form__btn"
                    type="submit"
                    disabled={isSending}
                >
                    {isSending ? t('contact.sending') : t('contact.send')}
                </button>

                </form>
            </section>
        </main>
    )
}

export default Contact
