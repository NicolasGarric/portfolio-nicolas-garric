import './Upcoming.css'

// Les statuts possibles d'un projet
// Tu peux en ajouter d'autres si tu veux
const STATUS = {
    inProgress: 'En cours',
    planned: 'Planifié',
    paused: 'En pause',
}

// Tes projets à venir — modifie avec tes vraies infos
const upcomingProjects = [
    {
        title: 'Portfolio de jeux',
        description: 'Interactive portfolio based in Rust/WebAssembly.',
        technologies: ['React', 'TypeScript', 'Rust', 'WebAssembly'],
        progress: 80,
        status: 'inProgress',
    },
    {
        title: 'Dark kitchen showcase site',
        description: 'Creating a showcase site for a dark kitchen in Bordeaux, France.',
        technologies: ['React', 'TypeScript', 'Rust', 'WebAssembly'],
        progress: 80,
        status: 'inProgress',
    },
    {
        title: 'Photographer showcase site',
        description: 'Creating a showcase site for a photographer in order to show his art.',
        technologies: ['React', 'TypeScript', 'Rust', 'WebAssembly'],
        progress: 20,
        status: 'planned',
    },
    {
        title: 'Tower Defense full game',
        description: 'Creating a full tower defense game based from a mix about FTL and Mindustry.',
        technologies: ['Rust', 'React'],
        progress: 10,
        status: 'planned',
    },
]

function Upcoming() {
    return (
        <main className="page">
            <section className="upcoming">

                <div className="upcoming__header">
                    <h1 className="upcoming__title">Projets à venir</h1>
                    <p className="upcoming__subtitle">
                        Ce sur quoi je travaille en ce moment
                    </p>
                </div>

                <div className="upcoming__list">
                    {upcomingProjects.map((project, index) => (
                        <div key={index} className="upcoming-card">

                            <div className="upcoming-card__top">
                                <h2 className="upcoming-card__title">
                                    {project.title}
                                </h2>
                                <span className={`upcoming-card__status upcoming-card__status--${project.status}`}>
                                    {STATUS[project.status as keyof typeof STATUS]}
                                </span>
                            </div>

                            <p className="upcoming-card__description">
                                {project.description}
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
                                    <span>Avancement</span>
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
