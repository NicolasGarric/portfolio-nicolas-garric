import './Projects.css'

const projects = [
    {
        title: 'Bjorg',
        url: 'https://bjorg.fr',
        role: 'Développeur Full Stack',
        description: 'Site client développé chez Castor & Pollux',
        technologies: ['WordPress', 'Twig', 'ACF', 'PHP', 'JS ES6+', 'SCSS'],
        screenshot: '/screenshots/Bjorg.jpg',
    },
    {
        title: 'Azura',
        url: 'https://www.azura-snacking.com/',
        role: 'Développeur Full Stack',
        description: 'Site client développé chez Castor & Pollux',
        technologies: ['WordPress', 'Twig', 'ACF', 'PHP', 'JS ES6+', 'SCSS'],
        screenshot: '/screenshots/Azura.jpg',
    },
    {
        title: 'Fraîcheur de Paris',
        url: 'https://fraicheurdeparis.fr',
        role: 'Développeur Full Stack',
        description: 'Site client développé chez Castor & Pollux',
        technologies: ['WordPress', 'Twig', 'ACF', 'PHP', 'JS ES6+', 'SCSS'],
        screenshot: '/screenshots/Fraicheur%20de%20paris.jpg',
    },
    {
        title: 'Butagaz',
        url: 'https://butagaz.fr',
        role: 'Développeur Full Stack',
        description: 'Site client développé chez Castor & Pollux',
        technologies: ['WordPress', 'Twig', 'ACF', 'PHP', 'JS ES6+', 'SCSS'],
        screenshot: '/screenshots/Butagaz.jpg',
    },
]

function Projects() {
    return (
        <main className="page">
            <section className="projects">
                <div className="projects__header">
                    <h1 className="projects__title">Sites réalisés</h1>
                    <p className="projects__subtitle">
                        Projets sur lesquels j'ai travaillé
                    </p>
                </div>

                <div className="projects__grid">
                    {projects.map((project, index) => (
                        <div
                            key={index}
                            className="project-card"
                            style={{
                                backgroundImage: `url(${project.screenshot})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center top',
                            }}
                        >
                            {/* Overlay glassmorphism */}
                            <div className="project-card__glass">

                                <div className="project-card__content">
                                    <h2 className="project-card__title">
                                        {project.title}
                                    </h2>

                                    <p className="project-card__description">
                                        {project.description}
                                    </p>

                                    <p className="project-card__role">
                                        👤 {project.role}
                                    </p>

                                    <div className="project-card__techs">
                                        {project.technologies.map((tech, i) => (
                                            <span key={i} className="project-card__tech">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {project.url !== '#' ? (
                                    <a
                                        href={project.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="project-card__link"
                                    >
                                        Voir le site →
                                    </a>
                                ) : (
                                    <span className="project-card__link project-card__link--disabled">
                                        Projet privé
                                    </span>
                                )}

                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    )
}

export default Projects
