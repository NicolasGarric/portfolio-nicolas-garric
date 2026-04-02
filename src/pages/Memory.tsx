import { useEffect, useRef, useState } from 'react'
import './Memory.css'
import { useScore } from '../hooks/useScore'

// Emojis associés à chaque valeur de carte (0 à 7)
const CARD_EMOJIS = ['🦀', '🐍', '🎮', '🚀', '⭐', '🎯', '🔥', '💎']

// Délai avant de cacher les cartes non appariées (ms)
const FLIP_DELAY = 800

function Memory() {
    const gameRef = useRef<any>(null)
    const [cards, setCards] = useState<{ value: number; state: number }[]>([])
    const [attempts, setAttempts] = useState(0)
    const [pairsFound, setPairsFound] = useState(0)
    const [won, setWon] = useState(false)
    const [started, setStarted] = useState(false)
    const [wasmReady, setWasmReady] = useState(false)
    // Bloque les clics pendant l'animation de retournement
    const [locked, setLocked] = useState(false)
    const { saveScore } = useScore()

    // Charge le WASM
    useEffect(() => {
        const script = document.createElement('script')
        script.type = 'module'
        script.innerHTML = `
        import init, * as MemoryWasm from '/memory-wasm/memory.js';
        await init();
        window.MemoryWasm = MemoryWasm;
        window.dispatchEvent(new Event('memory-wasm-ready'));
        `
        document.head.appendChild(script)

        window.addEventListener('memory-wasm-ready', () => {
        setWasmReady(true)
        }, { once: true })
    }, [])

    // Démarre une nouvelle partie
    const startGame = () => {
        const wasm = (window as any).MemoryWasm
        if (!wasm) return

        // On passe Date.now() comme seed — différent à chaque milliseconde
        gameRef.current = wasm.GameState.new(Date.now())
        syncState()
        setAttempts(0)
        setPairsFound(0)
        setWon(false)
        setStarted(true)
        setLocked(false)
    }

    // Synchronise l'état Rust → React
    const syncState = () => {
        if (!gameRef.current) return

        const raw = gameRef.current.get_cards()
        const parsed = []
        for (let i = 0; i < raw.length; i += 2) {
            parsed.push({ value: raw[i], state: raw[i + 1] })
        }
        setCards(parsed)
        setAttempts(gameRef.current.get_attempts())
        setPairsFound(gameRef.current.get_pairs_found())
    }

    // Gère le clic sur une carte
    const handleCardClick = (index: number) => {
        if (!gameRef.current || locked) return
        if (cards[index].state !== 0) return // Ignore hidden=0, flipped=1, matched=2

        const result = gameRef.current.flip_card(index)
        syncState()

        if (result === 1) {
            // Paire trouvée — vérifie si gagné
            if (gameRef.current.is_won()) {
                setWon(true)
                saveScore('memory', attempts + 1)
            }
        } else if (result === 2) {
            // Pas de paire — bloque les clics pendant l'animation
            setLocked(true)
            setTimeout(() => {
                syncState()
                setLocked(false)
            }, FLIP_DELAY)
        }
    }

    return (
        <main className="page">
            <section className="memory-page">

                <div className="memory-header">
                <h1 className="memory-header__title">Mémory</h1>
                {started && (
                    <div className="memory-header__info">
                    <span className="memory-header__stat">
                        Paires : {pairsFound} / 8
                    </span>
                    <span className="memory-header__stat">
                        Tentatives : {attempts}
                    </span>
                    </div>
                )}
                </div>

                {/* Grille de cartes */}
                {started && (
                    <div className="memory-grid">
                        {cards.map((card, index) => (
                        <div
                            key={index}
                            className={`memory-card ${
                            card.state === 1 ? 'memory-card--flipped' : ''
                            } ${card.state === 2 ? 'memory-card--matched' : ''}`}
                            onClick={() => handleCardClick(index)}
                        >
                            {/* Face cachée */}
                            <div className="memory-card__back">?</div>

                            {/* Face visible */}
                            <div className="memory-card__front">
                            {CARD_EMOJIS[card.value]}
                            </div>
                        </div>
                        ))}
                    </div>
                )}

                {/* Écran d'accueil */}
                {!started && (
                    <div className="memory-overlay">
                        <h2 className="memory-overlay__title">🃏 Mémory</h2>
                        <p className="memory-overlay__text">
                        Retourne les cartes et trouve toutes les paires !
                        </p>
                        <p className="memory-overlay__text">
                        Essaie de terminer en un minimum de tentatives.
                        </p>
                        <button
                        className="memory-overlay__btn"
                        onClick={startGame}
                        disabled={!wasmReady}
                        >
                        {wasmReady ? 'Jouer' : 'Chargement...'}
                        </button>
                    </div>
                )}

                {/* Écran victoire */}
                {won && (
                    <div className="memory-overlay memory-overlay--won">
                        <h2 className="memory-overlay__title">🎉 Gagné !</h2>
                        <p className="memory-overlay__text">
                        Terminé en {attempts} tentatives !
                        </p>
                        <button className="memory-overlay__btn" onClick={startGame}>
                        Rejouer
                        </button>
                    </div>
                )}

            </section>
        </main>
    )
}

export default Memory
