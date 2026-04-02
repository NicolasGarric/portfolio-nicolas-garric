import { useEffect, useRef, useState } from 'react'
import { useScore } from '../hooks/useScore'
import './TowerDefense.css'

const CELL_SIZE = 40
const GRID_WIDTH = 20
const GRID_HEIGHT = 15

// Types de tourelles disponibles
const TOWER_TYPES = [
    { id: 'Canon', label: 'Canon', emoji: '💣', cost: 50, desc: 'Dégâts élevés, portée courte' },
    { id: 'Machinegun', label: 'Mitrailleuse', emoji: '🔫', cost: 75, desc: 'Tir rapide, portée moyenne' },
    { id: 'Laser', label: 'Laser', emoji: '⚡', cost: 150, desc: 'Longue portée, pénètre l\'armure' },
    { id: 'Wall', label: 'Mur', emoji: '🧱', cost: 20, desc: 'Bloque les ennemis' },
]

// Couleurs par type
const TOWER_COLORS: Record<string, string> = {
    '1': '#ff922b', // Canon
    '2': '#339af0', // Mitrailleuse
    '3': '#cc5de8', // Laser
    '4': '#868e96', // Mur
    '5': '#51cf66', // Base
    '6': '#ff6b6b', // Spawn
}

const ENEMY_COLORS = ['#ff6b6b', '#ffd43b', '#ff4444']

function TowerDefense() {
    const { saveScore } = useScore()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const gameRef = useRef<any>(null)
    const animRef = useRef<number>(0)
    const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const [wasmReady, setWasmReady] = useState(false)
    const [started, setStarted] = useState(false)
    const [gameOver, setGameOver] = useState(false)
    const [won, setWon] = useState(false)
    const [selectedTower, setSelectedTower] = useState('Canon')
    const [resources, setResources] = useState(200)
    const [baseHp, setBaseHp] = useState(20)
    const [wave, setWave] = useState(0)
    const [waveInProgress, setWaveInProgress] = useState(false)
    const [, setScore] = useState(0)
    const [message, setMessage] = useState('')

    // Charge le WASM
    useEffect(() => {
        const script = document.createElement('script')
        script.type = 'module'
        script.src = '/wasm-loaders/tower-defense-loader.js'
        document.head.appendChild(script)

        window.addEventListener('tower-defense-wasm-ready', () => {
            setWasmReady(true)
        }, { once: true })
    }, [])

    // Démarre le jeu
    const startGame = () => {
        const wasm = (window as any).TowerDefenseWasm
        if (!wasm) return

        gameRef.current = wasm.GameState.new()

        setResources(200)
        setBaseHp(20)
        setWave(0)
        setWaveInProgress(false)
        setGameOver(false)
        setWon(false)
        setScore(0)
        setStarted(true)
    }

    // Gère le clic sur le canvas
    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!gameRef.current || !started || gameOver || won) return

        const canvas = canvasRef.current!
        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        const x = Math.floor((e.clientX - rect.left) * scaleX / CELL_SIZE)
        const y = Math.floor((e.clientY - rect.top) * scaleY / CELL_SIZE)

        if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return

        const wasm = (window as any).TowerDefenseWasm
        const towerType = wasm.TowerType[selectedTower]

        const placed = gameRef.current.place_tower(x, y, towerType)

        if (!placed) {
            const cost = TOWER_TYPES.find(t => t.id === selectedTower)?.cost ?? 0
            if (resources < cost) {
                showMessage('Pas assez de ressources !')
            } else {
                showMessage('Impossible de placer ici !')
            }
        } else {
            setResources(gameRef.current.get_resources())
        }
    }

    const showMessage = (msg: string) => {
        setMessage(msg)
        setTimeout(() => setMessage(''), 2000)
    }

    // Lance la vague
    const handleStartWave = () => {
        if (!gameRef.current || waveInProgress) return
        gameRef.current.start_wave()
        setWaveInProgress(true)
    }

    // Boucle de jeu
    useEffect(() => {
        if (!started || gameOver || won) return

        // Tick logique à 60fps
        tickRef.current = setInterval(() => {
            if (!gameRef.current) return

            gameRef.current.tick()

            const newResources = gameRef.current.get_resources()
            const newBaseHp = gameRef.current.get_base_hp()
            const newWave = gameRef.current.get_wave()
            const newWaveInProgress = gameRef.current.is_wave_in_progress()
            const isGameOver = gameRef.current.is_game_over()
            const isWon = gameRef.current.is_won()

            setResources(newResources)
            setBaseHp(newBaseHp)
            setWave(newWave)
            setWaveInProgress(newWaveInProgress)

            // Score = ressources accumulées
            setScore(newResources)

            if (isGameOver) {
                setGameOver(true)
                saveScore('tower-defense', newResources)
                clearInterval(tickRef.current!)
            }

            if (isWon) {
                setWon(true)
                saveScore('tower-defense', newResources)
                clearInterval(tickRef.current!)
            }
        }, 1000 / 60)

        return () => {
            if (tickRef.current) clearInterval(tickRef.current)
        }
    }, [started, gameOver, won])

    // Boucle de rendu
    useEffect(() => {
        if (!started) return

        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const render = () => {
            if (!gameRef.current) {
                animRef.current = requestAnimationFrame(render)
                return
            }

            const W = GRID_WIDTH * CELL_SIZE
            const H = GRID_HEIGHT * CELL_SIZE

            // Fond
            ctx.fillStyle = '#0f0f0f'
            ctx.fillRect(0, 0, W, H)

            // Grille
            const grid = gameRef.current.get_grid()
            for (let y = 0; y < GRID_HEIGHT; y++) {
                for (let x = 0; x < GRID_WIDTH; x++) {
                    const cell = grid[y * GRID_WIDTH + x]
                    const px = x * CELL_SIZE
                    const py = y * CELL_SIZE

                    if (cell === 0) {
                        // Case vide
                        ctx.fillStyle = '#141a14'
                        ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE)
                        ctx.strokeStyle = '#1e2e1e'
                        ctx.strokeRect(px, py, CELL_SIZE, CELL_SIZE)
                    } else {
                        // Tourelle ou élément spécial
                        const color = TOWER_COLORS[cell.toString()] ?? '#ffffff'
                        ctx.fillStyle = color
                        ctx.fillRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4)
                        ctx.strokeStyle = '#0f0f0f'
                        ctx.strokeRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4)

                        // Emoji sur les éléments importants
                        ctx.font = '2rem system-ui'
                        ctx.textAlign = 'center'
                        ctx.textBaseline = 'middle'
                        if (cell === 5) ctx.fillText('🏰', px + CELL_SIZE / 2, py + CELL_SIZE / 2)
                        if (cell === 6) ctx.fillText('👾', px + CELL_SIZE / 2, py + CELL_SIZE / 2)
                    }
                }
            }

            // Chemin
            const path = gameRef.current.get_path()
            ctx.strokeStyle = 'rgba(255, 150, 50, 0.3)'
            ctx.lineWidth = 3
            ctx.setLineDash([5, 5])
            if (path.length >= 4) {
                ctx.beginPath()
                ctx.moveTo(path[0], path[1])
                for (let i = 2; i < path.length; i += 2) {
                    ctx.lineTo(path[i], path[i + 1])
                }
                ctx.stroke()
            }
            ctx.setLineDash([])
            ctx.lineWidth = 1

            // Ennemis
            const enemies = gameRef.current.get_enemies()
            for (let i = 0; i < enemies.length; i += 5) {
                const ex = enemies[i]
                const ey = enemies[i + 1]
                const hpRatio = enemies[i + 2]
                const type = enemies[i + 3]
                const size = type === 2 ? 18 : type === 1 ? 14 : 10

                // Corps de l'ennemi
                ctx.fillStyle = ENEMY_COLORS[type] ?? '#ff6b6b'
                ctx.beginPath()
                ctx.arc(ex, ey, size, 0, Math.PI * 2)
                ctx.fill()

                // Barre de vie
                const barW = size * 2.5
                const barX = ex - barW / 2
                const barY = ey - size - 8

                ctx.fillStyle = '#333333'
                ctx.fillRect(barX, barY, barW, 4)
                ctx.fillStyle = hpRatio > 0.5 ? '#51cf66' : hpRatio > 0.25 ? '#ffd43b' : '#ff6b6b'
                ctx.fillRect(barX, barY, barW * hpRatio, 4)
            }

            // Projectiles
            const projectiles = gameRef.current.get_projectiles()
            for (let i = 0; i < projectiles.length; i += 3) {
                const px = projectiles[i]
                const py = projectiles[i + 1]
                const type = projectiles[i + 2]

                ctx.fillStyle = type === 0 ? '#ff922b' : type === 1 ? '#339af0' : '#cc5de8'
                ctx.beginPath()
                ctx.arc(px, py, type === 2 ? 3 : 5, 0, Math.PI * 2)
                ctx.fill()
            }

            animRef.current = requestAnimationFrame(render)
        }

        animRef.current = requestAnimationFrame(render)

        return () => cancelAnimationFrame(animRef.current)
    }, [started])

    return (
        <main className="page">
            <section className="td-page">

                <div className="td-header">
                    <h1 className="td-title">🏰 Tower Defense</h1>
                    {started && (
                        <div className="td-stats">
                            <span className="td-stat td-stat--resources">
                                💰 {resources}
                            </span>
                            <span className="td-stat td-stat--hp">
                                ❤️ {baseHp} / 20
                            </span>
                            <span className="td-stat td-stat--wave">
                                🌊 Vague {wave} / 10
                            </span>
                        </div>
                    )}
                </div>

                <div className="td-layout">

                    {/* Canvas */}
                    <div className="td-canvas-wrapper">
                        <canvas
                            ref={canvasRef}
                            width={GRID_WIDTH * CELL_SIZE}
                            height={GRID_HEIGHT * CELL_SIZE}
                            className="td-canvas"
                            onClick={handleCanvasClick}
                        />

                        {/* Message flash */}
                        {message && (
                            <div className="td-message">{message}</div>
                        )}

                        {/* Écran d'accueil */}
                        {!started && (
                            <div className="td-overlay">
                                <h2 className="td-overlay__title">🏰 Tower Defense</h2>
                                <p className="td-overlay__text">
                                    Place des tourelles pour stopper les vagues d'ennemis
                                </p>
                                <p className="td-overlay__text">
                                    Les ennemis arrivent depuis la gauche 👾
                                </p>
                                <p className="td-overlay__text">
                                    Protège ta base à droite 🏰
                                </p>
                                <button
                                    className="td-btn"
                                    onClick={startGame}
                                    disabled={!wasmReady}
                                >
                                    {wasmReady ? 'Commencer' : 'Chargement...'}
                                </button>
                            </div>
                        )}

                        {/* Game Over */}
                        {gameOver && (
                            <div className="td-overlay td-overlay--gameover">
                                <h2 className="td-overlay__title">💀 Game Over</h2>
                                <p className="td-overlay__text">
                                    Ta base a été détruite à la vague {wave}
                                </p>
                                <p className="td-overlay__score">
                                    Ressources : {resources} 💰
                                </p>
                                <button className="td-btn" onClick={startGame}>
                                    Rejouer
                                </button>
                            </div>
                        )}

                        {/* Victoire */}
                        {won && (
                            <div className="td-overlay td-overlay--won">
                                <h2 className="td-overlay__title">🎉 Victoire !</h2>
                                <p className="td-overlay__text">
                                    Tu as survécu aux 10 vagues !
                                </p>
                                <p className="td-overlay__score">
                                    Ressources : {resources} 💰
                                </p>
                                <button className="td-btn" onClick={startGame}>
                                    Rejouer
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Panneau de contrôle */}
                    {started && !gameOver && !won && (
                        <div className="td-panel">

                            <h3 className="td-panel__title">Tourelles</h3>

                            <div className="td-towers">
                                {TOWER_TYPES.map(tower => (
                                    <button
                                        key={tower.id}
                                        className={`td-tower-btn ${
                                            selectedTower === tower.id
                                                ? 'td-tower-btn--selected'
                                                : ''
                                        } ${
                                            resources < tower.cost
                                                ? 'td-tower-btn--disabled'
                                                : ''
                                        }`}
                                        onClick={() => setSelectedTower(tower.id)}
                                    >
                                        <span className="td-tower-btn__emoji">
                                            {tower.emoji}
                                        </span>
                                        <span className="td-tower-btn__label">
                                            {tower.label}
                                        </span>
                                        <span className="td-tower-btn__cost">
                                            💰 {tower.cost}
                                        </span>
                                        <span className="td-tower-btn__desc">
                                            {tower.desc}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="td-panel__divider" />

                            <div className="td-legend">
                                <h3 className="td-panel__title">Ennemis</h3>
                                <div className="td-legend-item">
                                    <span className="td-legend-dot" style={{ background: '#ff6b6b' }} />
                                    Scout — Rapide, peu de vie
                                </div>
                                <div className="td-legend-item">
                                    <span className="td-legend-dot" style={{ background: '#ffd43b' }} />
                                    Soldat — Équilibré
                                </div>
                                <div className="td-legend-item">
                                    <span className="td-legend-dot" style={{ background: '#ff4444' }} />
                                    Tank — Lent, armure lourde
                                </div>
                            </div>

                            <div className="td-panel__divider" />

                            <button
                                className={`td-wave-btn ${waveInProgress ? 'td-wave-btn--disabled' : ''}`}
                                onClick={handleStartWave}
                                disabled={waveInProgress}
                            >
                                {waveInProgress
                                    ? `⚔️ Vague ${wave} en cours...`
                                    : wave === 0
                                    ? '▶ Lancer la vague 1'
                                    : `▶ Lancer la vague ${wave + 1}`
                                }
                            </button>

                            {!waveInProgress && wave > 0 && (
                                <p className="td-panel__bonus">
                                    +50 💰 bonus entre les vagues !
                                </p>
                            )}

                        </div>
                    )}
                </div>

            </section>
        </main>
    )
}

export default TowerDefense
