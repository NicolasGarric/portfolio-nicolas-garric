import { useEffect, useRef, useState } from 'react'
import './Snake.css'
import { useScore } from '../hooks/useScore'
import init, * as SnakeWasmModule from '../wasm/snake/snake.js'

// Taille d'une case en pixels
const CELL_SIZE = 24
// Vitesse du jeu en millisecondes (plus petit = plus rapide)
const TICK_RATE = 150

function Snake() {
    // Référence vers le canvas HTML — c'est là qu'on dessine le jeu
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Référence vers l'état du jeu Rust — useRef car on ne veut pas
    // re-afficher le composant à chaque changement d'état du jeu
    const gameRef = useRef<any>(null)

    // État React pour le score et game over — ceux-là déclenchent un re-affichage
    const [score, setScore] = useState(0)
    const [gameOver, setGameOver] = useState(false)
    const [started, setStarted] = useState(false)
    const [wasmReady, setWasmReady] = useState(false)
    const { saveScore } = useScore()

    // Charge le module WASM au démarrage
    useEffect(() => {
        init().then(() => {
            (window as any).SnakeWasm = SnakeWasmModule
            setWasmReady(true)
        })
    }, [])

    const startGame = () => {
        const wasm = (window as any).SnakeWasm
        if (!wasm) return

        gameRef.current = wasm.GameState.new()
        setScore(0)
        setGameOver(false)
        setStarted(true)
    }

    // Boucle principale du jeu
    useEffect(() => {
        if (!started || gameOver) return

        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Écoute les touches du clavier
        const handleKey = (e: KeyboardEvent) => {
            const wasm = (window as any).SnakeWasm
            if (!gameRef.current || !wasm) return

            // Associe chaque touche à une direction Rust
            switch (e.key) {
                case 'ArrowUp':
                e.preventDefault()
                gameRef.current.change_direction(wasm.Direction.Up)
                break
                case 'ArrowDown':
                e.preventDefault()
                gameRef.current.change_direction(wasm.Direction.Down)
                break
                case 'ArrowLeft':
                e.preventDefault()
                gameRef.current.change_direction(wasm.Direction.Left)
                break
                case 'ArrowRight':
                e.preventDefault()
                gameRef.current.change_direction(wasm.Direction.Right)
                break
            }
        }

        window.addEventListener('keydown', handleKey)

        // Tick du jeu — s'exécute toutes les TICK_RATE millisecondes
        const interval = setInterval(() => {
            if (!gameRef.current) return

            // Avance le jeu d'un pas côté Rust
            gameRef.current.tick()

            // Récupère l'état depuis Rust
            const cells = gameRef.current.get_cells()
            const width = gameRef.current.get_width()
            gameRef.current.get_height()
            const currentScore = gameRef.current.get_score()
            const isGameOver = gameRef.current.is_game_over()

            // Met à jour le score React
            setScore(currentScore)

            if (isGameOver) {
                setGameOver(true)
                // Sauvegarde le score si connecté
                saveScore('snake', currentScore)
                return
            }

            // ===== DESSIN =====
            // Efface le canvas
            ctx.fillStyle = '#0f0f0f'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Dessine chaque case
            for (let i = 0; i < cells.length; i++) {
                const x = (i % width) * CELL_SIZE
                const y = Math.floor(i / width) * CELL_SIZE

                if (cells[i] === 1) {
                    // Serpent — vert
                    ctx.fillStyle = '#51cf66'
                    ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2)
                } else if (cells[i] === 2) {
                    // Pomme — rouge
                    ctx.fillStyle = '#ff6b6b'
                    ctx.beginPath()
                    ctx.arc(
                        x + CELL_SIZE / 2,
                        y + CELL_SIZE / 2,
                        CELL_SIZE / 2 - 2,
                        0,
                        Math.PI * 2
                    )
                    ctx.fill()
                }
            }
        }, TICK_RATE)

        // Nettoyage — supprime les listeners quand le composant se démonte
        return () => {
        clearInterval(interval)
        window.removeEventListener('keydown', handleKey)
        }
    }, [started, gameOver])

    const width = 20 * CELL_SIZE
    const height = 20 * CELL_SIZE

    return (
        <main className="page">
            <section className="snake-page">

                <div className="snake-header">
                    <h1 className="snake-header__title">Snake</h1>
                    <p className="snake-header__score">Score : {score}</p>
                </div>

                <div className="snake-canvas-wrapper">
                {/* Le canvas où le jeu est dessiné */}
                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className="snake-canvas"
                />

                {/* Écran d'accueil */}
                {!started && (
                    <div className="snake-overlay">
                        <h2 className="snake-overlay__title">🐍 Snake</h2>
                        <p className="snake-overlay__text">
                            Flèches du clavier ou boutons tactiles pour diriger le serpent
                        </p>
                        <button className="snake-overlay__btn" onClick={startGame} disabled={!wasmReady}>
                            {wasmReady ? 'Jouer' : 'Chargement...'}
                        </button>
                    </div>
                )}

                {/* Écran Game Over */}
                {gameOver && (
                    <div className="snake-overlay">
                    <h2 className="snake-overlay__title">Game Over</h2>
                    <p className="snake-overlay__text">Score final : {score}</p>
                    <button className="snake-overlay__btn" onClick={startGame}>
                        Rejouer
                    </button>
                    </div>
                )}
                </div>

                {/* Contrôles tactiles — visibles uniquement sur mobile */}
                {started && !gameOver && (
                    <div className="snake-controls">
                        <div className="snake-controls__row">
                            <button
                                className="snake-controls__btn"
                                onPointerDown={() => {
                                    const wasm = (window as any).SnakeWasm
                                    if (gameRef.current && wasm)
                                        gameRef.current.change_direction(wasm.Direction.Up)
                                }}
                            >▲</button>
                        </div>
                        <div className="snake-controls__row">
                            <button
                                className="snake-controls__btn"
                                onPointerDown={() => {
                                    const wasm = (window as any).SnakeWasm
                                    if (gameRef.current && wasm)
                                        gameRef.current.change_direction(wasm.Direction.Left)
                                }}
                            >◀</button>
                            <button
                                className="snake-controls__btn"
                                onPointerDown={() => {
                                    const wasm = (window as any).SnakeWasm
                                    if (gameRef.current && wasm)
                                        gameRef.current.change_direction(wasm.Direction.Down)
                                }}
                            >▼</button>
                            <button
                                className="snake-controls__btn"
                                onPointerDown={() => {
                                    const wasm = (window as any).SnakeWasm
                                    if (gameRef.current && wasm)
                                        gameRef.current.change_direction(wasm.Direction.Right)
                                }}
                            >▶</button>
                        </div>
                    </div>
                )}

            </section>
        </main>
    )
}

export default Snake
