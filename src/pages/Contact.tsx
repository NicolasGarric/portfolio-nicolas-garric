import { useState, useRef } from 'react'
import emailjs from 'emailjs-com'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import './Contact.css'

// Les données du formulaire
interface FormData {
    from_name: string
    from_email: string
    message: string
}

function Contact() {
    // État du formulaire — useState garde en mémoire les valeurs
    const [formData, setFormData] = useState<FormData>({
        from_name: '',
        from_email: '',
        message: '',
    })

    // État pour savoir si le CAPTCHA est validé
    const [captchaToken, setCaptchaToken] = useState<string | null>(null)

    // États pour gérer l'envoi
    const [isSending, setIsSending] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState(false)

    // Référence vers le composant hCaptcha pour pouvoir le réinitialiser
    const captchaRef = useRef<HCaptcha>(null)

    // Met à jour le champ modifié dans formData
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    // Appelé quand le CAPTCHA est validé — on reçoit le token
    const handleCaptcha = (token: string) => {
        setCaptchaToken(token)
    }

    // Appelé quand l'utilisateur soumet le formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        // Empêche le rechargement de la page (comportement par défaut d'un form)
        e.preventDefault()

        // Sécurité — on vérifie que le CAPTCHA est bien validé
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

            // Succès — on réinitialise tout
            setSuccess(true)
            setFormData({ from_name: '', from_email: '', message: '' })
            setCaptchaToken(null)
            captchaRef.current?.resetCaptcha()

        } catch (err) {
            setError(true)
        } finally {
            // Dans tous les cas on arrête le chargement
            setIsSending(false)
        }
    }

    return (
        <main className="page">
            <section className="contact">

                <div className="contact__header">
                    <h1 className="contact__title">Me contacter</h1>
                    <p className="contact__subtitle">
                        Une question, une opportunité ? Envoie-moi un message !
                    </p>
                </div>

                <form className="contact__form" onSubmit={handleSubmit}>

                {/* Champ Nom */}
                <div className="form__group">
                    <label className="form__label" htmlFor="from_name">
                        Nom
                    </label>
                    <input
                        className="form__input"
                        type="text"
                        id="from_name"
                        name="from_name"
                        value={formData.from_name}
                        onChange={handleChange}
                        placeholder="Ton nom"
                        required
                    />
                </div>

                {/* Champ Email */}
                <div className="form__group">
                    <label className="form__label" htmlFor="from_email">
                        Email
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

                {/* Champ Message */}
                <div className="form__group">
                    <label className="form__label" htmlFor="message">
                        Message
                    </label>
                    <textarea
                        className="form__textarea"
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Ton message..."
                        rows={6}
                        required
                    />
                </div>

                {/* CAPTCHA */}
                <div className="form__captcha">
                    <HCaptcha
                        sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY}
                        onVerify={handleCaptcha}
                        ref={captchaRef}
                        theme="dark"
                    />
                </div>

                {/* Messages de retour */}
                {success && (
                    <p className="form__success">
                        ✅ Message envoyé avec succès !
                    </p>
                )}
                {error && (
                    <p className="form__error">
                        ❌ Erreur — vérifie le CAPTCHA et réessaie.
                    </p>
                )}

                {/* Bouton d'envoi */}
                <button
                    className="form__btn"
                    type="submit"
                    disabled={isSending}
                >
                    {isSending ? 'Envoi en cours...' : 'Envoyer'}
                </button>

                </form>
            </section>
        </main>
    )
}

export default Contact
