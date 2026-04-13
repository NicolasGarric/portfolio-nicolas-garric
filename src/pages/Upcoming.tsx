import { useTranslation } from 'react-i18next'
import './Upcoming.css'

const upcomingProjects = [
    { titleKey: 'upcoming.p0_title', descKey: 'upcoming.p0_desc', technologies: ['React', 'TypeScript', 'Rust', 'WebAssembly'], progress: 80, status: 'inProgress' },
    { titleKey: 'upcoming.p1_title', descKey: 'upcoming.p1_desc', technologies: ['Next.js', 'TypeScript', 'Supabase', 'EmailJS', 'SCSS BEM', 'Vercel'], progress: 80, status: 'inProgress' },
    { titleKey: 'upcoming.p2_title', descKey: 'upcoming.p2_desc', technologies: ['React', 'TypeScript', 'Rust', 'WebAssembly'], progress: 20, status: 'planned' },
    { titleKey: 'upcoming.p3_title', descKey: 'upcoming.p3_desc', technologies: ['Rust', 'React'], progress: 10, status: 'planned' },
    { titleKey: 'upcoming.p4_title', descKey: 'upcoming.p4_desc', technologies: ['Tauri v2', 'Rust', 'SQLite', 'HTML/CSS/JS', 'iOS', 'Android', 'FR/EN'], progress: 40, status: 'inProgress' },
]

function Upcoming() {
    const { t } = useTranslation()

    return (
        <main className="page">
            <section className="upcoming">

                <div className="upcoming__header">
                    <h1 className="upcoming__title">{t('upcoming.title')}</h1>
                    <p className="upcoming__subtitle">
                        {t('upcoming.subtitle')}
                    </p>
                </div>

                <div className="upcoming__list">
                    {upcomingProjects.map((project, index) => (
                        <div key={index} className="upcoming-card">

                            <div className="upcoming-card__top">
                                <h2 className="upcoming-card__title">
                                    {t(project.titleKey)}
                                </h2>
                                <span className={`upcoming-card__status upcoming-card__status--${project.status}`}>
                                    {t(`upcoming.status.${project.status}`)}
                                </span>
                            </div>

                            <p className="upcoming-card__description">
                                {t(project.descKey)}
                            </p>

                            <div className="upcoming-card__techs">
                                {project.technologies.map((tech, i) => (
                                    <span key={i} className="upcoming-card__tech">
                                        {tech}
                                    </span>
                                ))}
                            </div>

                            <div className="upcoming-card__progress-wrapper">
                                <div className="upcoming-card__progress-label">
                                    <span>{t('upcoming.progress')}</span>
                                    <span>{project.progress}%</span>
                                </div>
                                <div className="upcoming-card__progress-bar">
                                    <div
                                        className="upcoming-card__progress-fill"
                                        style={{ width: `${project.progress}%` }}
                                    />
                                </div>
                            </div>

                        </div>
                    ))}
                </div>

            </section>
        </main>
    )
}

export default Upcoming
