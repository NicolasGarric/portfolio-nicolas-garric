import { useEffect, useRef, useState } from 'react'
import { useScore } from '../hooks/useScore'
import './NasaQuiz.css'

// Structure d'une image NASA APOD
interface ApodData {
    title: string
    explanation: string
    url: string
    date: string
    media_type: string
}

// Structure d'une question
interface QuizQuestion {
    apod: ApodData
    question: string
    answers: string[]
    correctIndex: number
}

const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY
const TOTAL_QUESTIONS = 5

// Génère des dates aléatoires pour récupérer des images variées
// L'API APOD existe depuis 1995
function randomDate(): string {
    const start = new Date(2010, 0, 1)
    const end = new Date(2024, 11, 31)
    const date = new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
    )
    return date.toISOString().split('T')[0]
}

// Génère une question à partir des données APOD
function generateQuestion(apod: ApodData): QuizQuestion {
    // Pool de questions possibles
    const questionTypes = [
        {
            question: `Quel est le titre de cette image spatiale ?`,
            correct: apod.title,
            wrongs: [
                'Nébuleuse de la Rosette',
                'Galaxie d\'Andromède',
                'Amas de Pléiades',
                'Voie Lactée panoramique',
                'Supernova de Cassiopée',
                'Cratères de la Lune',
                'Aurora Borealis',
                'Comète de Halley',
            ],
        },
        {
            question: `En quelle année cette photo a-t-elle été prise ?`,
            correct: new Date(apod.date).getFullYear().toString(),
            wrongs: ['2018', '2019', '2020', '2021', '2022', '2023', '2015', '2016'],
        },
    ]

    // Choisit un type de question aléatoirement
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)]

    // Filtre les mauvaises réponses pour éviter les doublons avec la bonne
    const filteredWrongs = type.wrongs.filter(w => w !== type.correct)

    // Prend 3 mauvaises réponses aléatoires
    const shuffledWrongs = filteredWrongs
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)

    // Position aléatoire pour la bonne réponse
    const correctIndex = Math.floor(Math.random() * 4)
    const answers = [...shuffledWrongs]
    answers.splice(correctIndex, 0, type.correct)

    return {
        apod,
        question: type.question,
        answers,
        correctIndex,
    }
}

function NasaQuiz() {
    const { saveScore } = useScore()

    const gameRef = useRef<any>(null)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const [wasmReady, setWasmReady] = useState(false)
    const [loading, setLoading] = useState(false)
    const [started, setStarted] = useState(false)
    const [gameOver, setGameOver] = useState(false)

    const [questions, setQuestions] = useState<QuizQuestion[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(15)
    const [answered, setAnswered] = useState(false)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [isCorrect, setIsCorrect] = useState(false)
    const [error, setError] = useState('')

    // Charge le WASM
    useEffect(() => {
        const script = document.createElement('script')
        script.type = 'module'
        script.src = '/wasm-loaders/nasa-quiz-loader.js'
        document.head.appendChild(script)

        window.addEventListener('nasa-quiz-wasm-ready', () => {
            setWasmReady(true)
        }, { once: true })
    }, [])

    // Récupère les images NASA
    const fetchQuestions = async () => {
        setLoading(true)
        setError('')

        try {
            const apods: ApodData[] = []

            // Récupère TOTAL_QUESTIONS images différentes
            for (let i = 0; i < TOTAL_QUESTIONS; i++) {
                let attempts = 0
                while (attempts < 5) {
                    const date = randomDate()
                    const res = await fetch(
                        `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&date=${date}`
                    )
                    const data = await res.json()

                    // On ne garde que les images (pas les vidéos)
                    if (data.media_type === 'image' && data.url) {
                        apods.push(data)
                        break
                    }
                    attempts++
                }
            }

            if (apods.length < TOTAL_QUESTIONS) {
                throw new Error('Impossible de récupérer assez d\'images')
            }

            // Génère les questions
            const generated = apods.map(apod => generateQuestion(apod))
            setQuestions(generated)

            // Initialise Rust avec les questions
            const wasm = (window as any).NasaQuizWasm
            const game = wasm.GameState.new()

            generated.forEach(q => {
                const data = [
                    q.question,
                    ...q.answers,
                    q.correctIndex.toString(),
                ].join('|')
                game.add_question(data)
            })

            gameRef.current = game
            setLoading(false)
            return true

        } catch (err) {
            setError('Erreur lors du chargement des images NASA. Vérifie ta clé API.')
            setLoading(false)
            return false
        }
    }

    // Démarre le jeu
    const startGame = async () => {
        const ok = await fetchQuestions()
        if (!ok) return

        setCurrentIndex(0)
        setScore(0)
        setTimeLeft(15)
        setAnswered(false)
        setSelectedAnswer(null)
        setGameOver(false)
        setStarted(true)
    }

    // Timer
    useEffect(() => {
        if (!started || answered || gameOver) return

        timerRef.current = setInterval(() => {
            if (!gameRef.current) return

            gameRef.current.tick_timer()
            const t = gameRef.current.get_time_left()
            setTimeLeft(t)

            if (gameRef.current.is_answered()) {
                setAnswered(true)
                setIsCorrect(false)
                clearInterval(timerRef.current!)
            }
        }, 1000)

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [started, answered, gameOver, currentIndex])

    // Répond à une question
    const handleAnswer = (index: number) => {
        if (answered || !gameRef.current) return

        if (timerRef.current) clearInterval(timerRef.current)

        const correct = gameRef.current.answer(index)
        const newScore = gameRef.current.get_score()

        setSelectedAnswer(index)
        setAnswered(true)
        setIsCorrect(correct)
        setScore(newScore)
    }

    // Question suivante
    const handleNext = () => {
        if (!gameRef.current) return

        gameRef.current.next_question()

        if (gameRef.current.is_game_over()) {
            setGameOver(true)
            saveScore('nasa-quiz', score)
            return
        }

        setCurrentIndex(prev => prev + 1)
        setTimeLeft(15)
        setAnswered(false)
        setSelectedAnswer(null)
    }

    const currentQuestion = questions[currentIndex]

    return (
        <main className="page">
            <section className="nasa-quiz">

                <div className="nasa-quiz__header">
                    <h1 className="nasa-quiz__title">🚀 Quiz Spatial NASA</h1>
                    {started && !gameOver && (
                        <div className="nasa-quiz__stats">
                            <span className="nasa-quiz__stat">
                                Question {currentIndex + 1} / {TOTAL_QUESTIONS}
                            </span>
                            <span className="nasa-quiz__stat">
                                Score : {score}
                            </span>
                            <span className={`nasa-quiz__timer ${timeLeft <= 5 ? 'nasa-quiz__timer--urgent' : ''}`}>
                                ⏱ {timeLeft}s
                            </span>
                        </div>
                    )}
                </div>

                {/* Écran d'accueil */}
                {!started && !loading && (
                    <div className="nasa-quiz__overlay">
                        <div className="nasa-quiz__overlay-content">
                            <p className="nasa-quiz__overlay-emoji">🌌</p>
                            <h2 className="nasa-quiz__overlay-title">Quiz Spatial NASA</h2>
                            <p className="nasa-quiz__overlay-text">
                                Découvre des images réelles de l'espace prises par la NASA
                                et réponds à des questions sur chacune d'elles.
                            </p>
                            <p className="nasa-quiz__overlay-text">
                                {TOTAL_QUESTIONS} questions — 15 secondes par question
                            </p>
                            <p className="nasa-quiz__overlay-text">
                                ⭐ Bonus de points si tu réponds vite !
                            </p>
                            {error && <p className="nasa-quiz__error">{error}</p>}
                            <button
                                className="nasa-quiz__btn"
                                onClick={startGame}
                                disabled={!wasmReady}
                            >
                                {wasmReady ? 'Commencer' : 'Chargement...'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Chargement */}
                {loading && (
                    <div className="nasa-quiz__overlay">
                        <div className="nasa-quiz__overlay-content">
                            <p className="nasa-quiz__overlay-emoji">🔭</p>
                            <h2 className="nasa-quiz__overlay-title">
                                Chargement des images NASA...
                            </h2>
                            <p className="nasa-quiz__overlay-text">
                                Récupération des photos de l'espace 🌠
                            </p>
                            <div className="nasa-quiz__loader" />
                        </div>
                    </div>
                )}

                {/* Jeu en cours */}
                {started && !loading && !gameOver && currentQuestion && (
                    <div className="nasa-quiz__game">

                        {/* Image NASA */}
                        <div className="nasa-quiz__image-wrapper">
                            <img
                                src={currentQuestion.apod.url}
                                alt={currentQuestion.apod.title}
                                className="nasa-quiz__image"
                            />
                            <div className="nasa-quiz__image-overlay">
                                <p className="nasa-quiz__image-date">
                                    📅 {currentQuestion.apod.date}
                                </p>
                            </div>
                        </div>

                        {/* Description courte */}
                        <p className="nasa-quiz__description">
                            {currentQuestion.apod.explanation.slice(0, 200)}...
                        </p>

                        {/* Question */}
                        <h2 className="nasa-quiz__question">
                            {currentQuestion.question}
                        </h2>

                        {/* Réponses */}
                        <div className="nasa-quiz__answers">
                            {currentQuestion.answers.map((answer, index) => (
                                <button
                                    key={index}
                                    className={`nasa-quiz__answer ${
                                        answered && index === currentQuestion.correctIndex
                                            ? 'nasa-quiz__answer--correct'
                                            : ''
                                    } ${
                                        answered &&
                                        selectedAnswer === index &&
                                        index !== currentQuestion.correctIndex
                                            ? 'nasa-quiz__answer--wrong'
                                            : ''
                                    }`}
                                    onClick={() => handleAnswer(index)}
                                    disabled={answered}
                                >
                                    <span className="nasa-quiz__answer-letter">
                                        {['A', 'B', 'C', 'D'][index]}
                                    </span>
                                    {answer}
                                </button>
                            ))}
                        </div>

                        {/* Feedback + bouton suivant */}
                        {answered && (
                            <div className="nasa-quiz__feedback">
                                <p className={`nasa-quiz__feedback-text ${
                                    isCorrect
                                        ? 'nasa-quiz__feedback-text--correct'
                                        : 'nasa-quiz__feedback-text--wrong'
                                }`}>
                                    {isCorrect
                                        ? `✅ Correct ! +${10 + timeLeft} points`
                                        : `❌ Raté ! La bonne réponse était : ${
                                            currentQuestion.answers[currentQuestion.correctIndex]
                                          }`
                                    }
                                </p>
                                <button
                                    className="nasa-quiz__btn"
                                    onClick={handleNext}
                                >
                                    {currentIndex + 1 >= TOTAL_QUESTIONS
                                        ? 'Voir le score final'
                                        : 'Question suivante →'
                                    }
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Game Over */}
                {gameOver && (
                    <div className="nasa-quiz__overlay">
                        <div className="nasa-quiz__overlay-content">
                            <p className="nasa-quiz__overlay-emoji">🏆</p>
                            <h2 className="nasa-quiz__overlay-title">Quiz terminé !</h2>
                            <p className="nasa-quiz__score-final">
                                Score final : {score} pts
                            </p>
                            <p className="nasa-quiz__overlay-text">
                                {score >= 100
                                    ? '🌟 Excellent ! Tu es un vrai astronome !'
                                    : score >= 60
                                    ? '🚀 Bien joué ! Continue à explorer !'
                                    : '🔭 Continue à explorer l\'univers !'}
                            </p>
                            <button
                                className="nasa-quiz__btn"
                                onClick={startGame}
                            >
                                Rejouer
                            </button>
                        </div>
                    </div>
                )}

            </section>
        </main>
    )
}

export default NasaQuiz
