import { useEffect, useRef, useState } from 'react'
import './Breakout.css'
import { useScore } from '../hooks/useScore'

const TICK_RATE = 16 // ~60fps

// Couleurs des briques selon le nombre de points
const BRICK_COLORS: Record<number, string> = {
  50: '#ff6b6b', // rouge — rangée du haut
  40: '#ff922b', // orange
  30: '#ffd43b', // jaune
  20: '#51cf66', // vert
  10: '#339af0', // bleu — rangée du bas
}

function Breakout() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const gameRef = useRef<any>(null)
    const keysRef = useRef({ left: false, right: false })

    const [score, setScore] = useState(0)
    const [lives, setLives] = useState(3)
    const [gameOver, setGameOver] = useState(false)
    const [won, setWon] = useState(false)
    const [started, setStarted] = useState(false)
    const [wasmReady, setWasmReady] = useState(false)
    const { saveScore } = useScore()

    // Charge le WASM au démarrage
    useEffect(() => {
        const script = document.createElement('script')
        script.type = 'module'
        script.src = '/wasm-loaders/breakout-loader.js'
        document.head.appendChild(script)

        window.addEventListener('breakout-wasm-ready', () => {
            setWasmReady(true)
            }, { once: true })
    }, [])

    const startGame = () => {
        const wasm = (window as any).BreakoutWasm
        if (!wasm) return
        gameRef.current = wasm.GameState.new()
        setScore(0)
        setLives(3)
        setGameOver(false)
        setWon(false)
        setStarted(true)
    }

    // Boucle principale
    useEffect(() => {
        if (!started || gameOver || won) return

        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Gestion clavier
        const handleKeyDown = (e: KeyboardEvent) => {
            const wasm = (window as any).BreakoutWasm
            if (!wasm || !gameRef.current) return

            if (e.key === 'ArrowLeft') {
                e.preventDefault()
                keysRef.current.left = true
                gameRef.current.set_paddle_direction(wasm.PaddleDirection.Left)
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault()
                keysRef.current.right = true
                gameRef.current.set_paddle_direction(wasm.PaddleDirection.Right)
            }
            // Espace pour lancer la balle
            if (e.key === ' ') {
                e.preventDefault()
                gameRef.current.launch_ball()
            }
        }

        const handleKeyUp = (e: KeyboardEvent) => {
            const wasm = (window as any).BreakoutWasm
            if (!wasm || !gameRef.current) return

            if (e.key === 'ArrowLeft') keysRef.current.left = false
            if (e.key === 'ArrowRight') keysRef.current.right = false

            // Si aucune touche enfoncée, arrête la raquette
            if (!keysRef.current.left && !keysRef.current.right) {
                gameRef.current.set_paddle_direction(wasm.PaddleDirection.None)
            } else if (keysRef.current.left) {
                gameRef.current.set_paddle_direction(wasm.PaddleDirection.Left)
            } else if (keysRef.current.right) {
                gameRef.current.set_paddle_direction(wasm.PaddleDirection.Right)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        const interval = setInterval(() => {
            if (!gameRef.current) return

            gameRef.current.tick()

            const isGameOver = gameRef.current.is_game_over()
            const isWon = gameRef.current.is_won()
            const currentScore = gameRef.current.get_score()
            const currentLives = gameRef.current.get_lives()

            setScore(currentScore)
            setLives(currentLives)

            if (isGameOver) {
                setGameOver(true)
                saveScore('breakout', currentScore)
                return
            }
            if (isWon) {
                setWon(true)
                saveScore('breakout', currentScore)
                return
            }
            
            // ===== DESSIN =====
            const W = gameRef.current.get_canvas_width()
            const H = gameRef.current.get_canvas_height()

            // Fond
            ctx.fillStyle = '#0f0f0f'
            ctx.fillRect(0, 0, W, H)

            // Briques
            const bricks = gameRef.current.get_bricks()
            const brickW = gameRef.current.get_brick_width()
            const brickH = gameRef.current.get_brick_height()

            for (let i = 0; i < bricks.length; i += 4) {
                const active = bricks[i]
                const points = bricks[i + 1]
                const x = bricks[i + 2]
                const y = bricks[i + 3]

                if (active === 1) {
                ctx.fillStyle = BRICK_COLORS[points] ?? '#aaaaaa'
                ctx.beginPath()
                ctx.roundRect(x, y, brickW, brickH, 4)
                ctx.fill()
                }
            }

            // Raquette
            const px = gameRef.current.get_paddle_x()
            const py = gameRef.current.get_paddle_y()
            const pw = gameRef.current.get_paddle_width()
            const ph = gameRef.current.get_paddle_height()

            ctx.fillStyle = '#845ef7'
            ctx.beginPath()
            ctx.roundRect(px, py, pw, ph, 6)
            ctx.fill()

            // Balle
            const bx = gameRef.current.get_ball_x()
            const by = gameRef.current.get_ball_y()
            const bs = gameRef.current.get_ball_size()

            ctx.fillStyle = '#ffffff'
            ctx.beginPath()
            ctx.arc(bx, by, bs / 2, 0, Math.PI * 2)
            ctx.fill()

            // Message "Appuie sur Espace" si balle collée
            if (gameRef.current.is_ball_stuck()) {
                ctx.fillStyle = 'rgba(255,255,255,0.5)'
                ctx.font = '1.4rem system-ui'
                ctx.textAlign = 'center'
                ctx.fillText('Appuie sur Espace pour lancer', W / 2, py - 20)
            }
        }, TICK_RATE)

        return () => {
            clearInterval(interval)
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [started, gameOver, won])

    return (
        <main className="page">
        <section className="breakout-page">

            <div className="breakout-header">
                <h1 className="breakout-header__title">Casse-briques</h1>
                <div className="breakout-header__info">
                    <span className="breakout-header__score">Score : {score}</span>
                    <span className="breakout-header__lives">
                    {'❤️'.repeat(lives)}
                    </span>
                </div>
            </div>

            <div className="breakout-canvas-wrapper">
            <canvas
                ref={canvasRef}
                width={480}
                height={600}
                className="breakout-canvas"
            />

            {/* Écran d'accueil */}
            {!started && (
                <div className="breakout-overlay">
                    <h2 className="breakout-overlay__title">🧱 Casse-briques</h2>
                    <p className="breakout-overlay__text">
                        Flèches gauche/droite pour bouger la raquette
                    </p>
                    <p className="breakout-overlay__text">
                        Espace pour lancer la balle — ou les boutons tactiles
                    </p>
                    <button
                        className="breakout-overlay__btn"
                        onClick={startGame}
                        disabled={!wasmReady}
                    >
                        {wasmReady ? 'Jouer' : 'Chargement...'}
                    </button>
                </div>
            )}

            {/* Game Over */}
            {gameOver && (
                <div className="breakout-overlay">
                    <h2 className="breakout-overlay__title">Game Over</h2>
                    <p className="breakout-overlay__text">Score final : {score}</p>
                    <button className="breakout-overlay__btn" onClick={startGame}>
                        Rejouer
                    </button>
                </div>
            )}

            {/* Victoire */}
            {won && (
                <div className="breakout-overlay breakout-overlay--won">
                    <h2 className="breakout-overlay__title">🎉 Gagné !</h2>
                    <p className="breakout-overlay__text">Score final : {score}</p>
                    <button className="breakout-overlay__btn" onClick={startGame}>
                        Rejouer
                    </button>
                </div>
            )}
            </div>

            {/* Contrôles tactiles — visibles uniquement sur mobile */}
            {started && !gameOver && !won && (
                <div className="breakout-controls">
                    <button
                        className="breakout-controls__btn"
                        onPointerDown={(e) => {
                            e.currentTarget.setPointerCapture(e.pointerId)
                            const wasm = (window as any).BreakoutWasm
                            if (gameRef.current && wasm)
                                gameRef.current.set_paddle_direction(wasm.PaddleDirection.Left)
                        }}
                        onPointerUp={() => {
                            const wasm = (window as any).BreakoutWasm
                            if (gameRef.current && wasm)
                                gameRef.current.set_paddle_direction(wasm.PaddleDirection.None)
                        }}
                    >◀ Gauche</button>
                    <button
                        className="breakout-controls__btn breakout-controls__btn--launch"
                        onPointerDown={() => {
                            if (gameRef.current)
                                gameRef.current.launch_ball()
                        }}
                    >● Lancer</button>
                    <button
                        className="breakout-controls__btn"
                        onPointerDown={(e) => {
                            e.currentTarget.setPointerCapture(e.pointerId)
                            const wasm = (window as any).BreakoutWasm
                            if (gameRef.current && wasm)
                                gameRef.current.set_paddle_direction(wasm.PaddleDirection.Right)
                        }}
                        onPointerUp={() => {
                            const wasm = (window as any).BreakoutWasm
                            if (gameRef.current && wasm)
                                gameRef.current.set_paddle_direction(wasm.PaddleDirection.None)
                        }}
                    >Droite ▶</button>
                </div>
            )}

        </section>
        </main>
    )
}

export default Breakout
