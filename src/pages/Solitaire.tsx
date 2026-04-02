import { useEffect, useRef, useState, useCallback } from 'react'
import { useScore } from '../hooks/useScore'
import './Solitaire.css'


interface CardData {
    suit: number
    rank: number
    faceUp: boolean
}

interface DragInfo {
    source: 'waste' | 'tableau'
    col?: number
    cardIdx?: number
}

function Solitaire() {
    const { saveScore } = useScore()
    const gameRef = useRef<any>(null)
    const [wasmReady, setWasmReady] = useState(false)
    const [started, setStarted] = useState(false)
    const [won, setWon] = useState(false)

    const [tableau, setTableau] = useState<CardData[][]>([])
    const [wasteTop, setWasteTop] = useState<CardData | null>(null)
    const [stockCount, setStockCount] = useState(0)
    const [foundations, setFoundations] = useState<number[]>([-1, -1, -1, -1])
    const [foundationSuits, setFoundationSuits] = useState<number[]>([-1, -1, -1, -1])
    const [score, setScore] = useState(0)
    const [moves, setMoves] = useState(0)

    const [dragInfo, setDragInfo] = useState<DragInfo | null>(null)

    // Charge le WASM
    useEffect(() => {
        const script = document.createElement('script')
        script.type = 'module'
        script.src = '/wasm-loaders/solitaire-loader.js'
        document.head.appendChild(script)
        window.addEventListener('solitaire-wasm-ready', () => setWasmReady(true), { once: true })
    }, [])

    // Synchronise l'état Rust → React
    const syncState = useCallback(() => {
        if (!gameRef.current) return

        // Tableau
        const raw = gameRef.current.get_tableau()
        console.log('Raw tableau:', Array.from(raw))
        const cols: CardData[][] = []
        let i = 0
        for (let col = 0; col < 7; col++) {
            const count = raw[i++]
            const cards: CardData[] = []
            for (let c = 0; c < count; c++) {
                cards.push({
                    suit: raw[i++],
                    rank: raw[i++],
                    faceUp: raw[i++] === 1,
                })
            }
            cols.push(cards)
        }
        setTableau(cols)

        // Défausse
        const waste = gameRef.current.get_waste_top()
        setWasteTop(waste.length > 0 ? { suit: waste[0], rank: waste[1], faceUp: true } : null)

        // Pioche
        setStockCount(gameRef.current.get_stock_count())

        // Fondations
        setFoundations(Array.from(gameRef.current.get_foundations()))
        setFoundationSuits(Array.from(gameRef.current.get_foundation_suits()))

        // Stats
        setScore(gameRef.current.get_score())
        setMoves(gameRef.current.get_moves())

        // Victoire
        if (gameRef.current.is_won()) {
            setWon(true)
            // Sauvegarde le nombre de mouvements comme score
            saveScore('solitaire', gameRef.current.get_moves())
        }
    }, [saveScore])

    const startGame = () => {
        const wasm = (window as any).SolitaireWasm
        if (!wasm) return
        gameRef.current = wasm.GameState.new(Date.now())
        setWon(false)
        setDragInfo(null)
        syncState()
        setStarted(true)
    }

    // Clique sur la pioche
    const handleStockClick = () => {
        if (!gameRef.current) return
        gameRef.current.draw_from_stock()
        syncState()
    }

    // Double-clic sur défausse → fondation auto
    const handleWasteDoubleClick = () => {
        if (!gameRef.current) return
        gameRef.current.auto_move_waste_to_foundation()
        syncState()
    }

    // Double-clic sur carte du tableau → fondation auto
    const handleTableauDoubleClick = (col: number) => {
        if (!gameRef.current) return
        gameRef.current.auto_move_to_foundation(col)
        syncState()
    }

    // ===== DRAG & DROP =====
    const handleDragStart = (source: 'waste' | 'tableau', col?: number, cardIdx?: number) => {
        setDragInfo({ source, col, cardIdx })
    }

    const handleDropOnTableau = (toCol: number) => {
        if (!dragInfo || !gameRef.current) return

        if (dragInfo.source === 'waste') {
            gameRef.current.move_waste_to_tableau(toCol)
        } else if (dragInfo.source === 'tableau' && dragInfo.col !== undefined && dragInfo.cardIdx !== undefined) {
            gameRef.current.move_tableau_to_tableau(dragInfo.col, dragInfo.cardIdx, toCol)
        }

        setDragInfo(null)
        syncState()
    }

    const handleDropOnFoundation = (foundation: number) => {
        if (!dragInfo || !gameRef.current) return

        if (dragInfo.source === 'waste') {
            gameRef.current.move_waste_to_foundation(foundation)
        } else if (dragInfo.source === 'tableau' && dragInfo.col !== undefined) {
            gameRef.current.move_tableau_to_foundation(dragInfo.col, foundation)
        }

        setDragInfo(null)
        syncState()
    }

    const renderCard = (
        card: CardData,
        key: string,
        draggable: boolean,
        onDragStart?: () => void,
        onDoubleClick?: () => void,
        style?: React.CSSProperties
    ) => {
        // Noms des couleurs selon svg-cards
        const suitNames = ['spade', 'heart', 'diamond', 'club']
        // Noms des rangs selon svg-cards (1=As, puis 2-10, jack, queen, king)
        const rankNames = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king']
        const cardName = `${suitNames[card.suit]}_${rankNames[card.rank]}`

        return (
            <div
                key={key}
                className={`sol-card sol-card--svg ${draggable ? 'sol-card--draggable' : ''}`}
                draggable={draggable}
                onDragStart={draggable ? onDragStart : undefined}
                onDoubleClick={onDoubleClick}
                style={style}
            >
                <svg
                    viewBox="0 0 169.075 244.640"
                    width="100%"
                    height="100%"
                >
                    <use href={`/svg-cards.svg#${cardName}`} x="0" y="0" />
                </svg>
            </div>
        )
    }

    const renderCardBack = (key: string, style?: React.CSSProperties) => (
        <div key={key} className="sol-card sol-card--svg sol-card--back-svg" style={style}>
            <svg viewBox="0 0 169.075 244.640" width="100%" height="100%">
                <use href="/svg-cards.svg#back" x="0" y="0" />
            </svg>
        </div>
    )

    return (
        <main className="page">
            <section className="sol-page">

                {/* Header */}
                <div className="sol-header">
                    <h1 className="sol-title">🃏 Solitaire</h1>
                    {started && (
                        <div className="sol-stats">
                            <span className="sol-stat">⭐ {score} pts</span>
                            <span className="sol-stat">🔄 {moves} mouvements</span>
                            <button className="sol-new-game" onClick={startGame}>
                                Nouvelle partie
                            </button>
                        </div>
                    )}
                </div>

                {/* Écran d'accueil */}
                {!started && (
                    <div className="sol-overlay">
                        <p className="sol-overlay__emoji">🃏</p>
                        <h2 className="sol-overlay__title">Solitaire Klondike</h2>
                        <p className="sol-overlay__text">
                            Classe toutes les cartes dans les fondations par couleur de l'As au Roi
                        </p>
                        <div className="sol-rules">
                            <p>♠♥♦♣ — 4 fondations As → Roi</p>
                            <p>Alternance rouge/noir dans le tableau</p>
                            <p>Double-clic pour envoyer en fondation</p>
                            <p>Glisser-déposer pour déplacer</p>
                        </div>
                        <button
                            className="sol-btn"
                            onClick={startGame}
                            disabled={!wasmReady}
                        >
                            {wasmReady ? 'Jouer' : 'Chargement...'}
                        </button>
                    </div>
                )}

                {/* Victoire */}
                {won && (
                    <div className="sol-overlay sol-overlay--won">
                        <p className="sol-overlay__emoji">🎉</p>
                        <h2 className="sol-overlay__title">Bravo !</h2>
                        <p className="sol-overlay__score">{score} pts</p>
                        <p className="sol-overlay__text">
                            Terminé en {moves} mouvements !
                        </p>
                        <button className="sol-btn" onClick={startGame}>
                            Rejouer
                        </button>
                    </div>
                )}

                {/* Jeu */}
                {started && !won && (
                    <div className="sol-game">

                        {/* Zone du haut — pioche + fondations */}
                        <div className="sol-top">

                            {/* Pioche */}
                            <div
                                className="sol-stock"
                                onClick={handleStockClick}
                            >
                                {stockCount > 0 ? (
                                    <div className="sol-card" style={{ position: 'relative' }}>
                                        <svg viewBox="0 0 169.075 244.640" width="100%" height="100%">
                                            <use href="/svg-cards.svg#back" x="0" y="0" />
                                        </svg>
                                        <span className="sol-stock__count">{stockCount}</span>
                                    </div>
                                ) : (
                                    <div className="sol-stock--empty">↺</div>
                                )}
                            </div>

                            {/* Défausse */}
                            <div className="sol-waste">
                                {wasteTop ? (
                                    renderCard(
                                        wasteTop,
                                        'waste-top',
                                        true,
                                        () => handleDragStart('waste'),
                                        handleWasteDoubleClick
                                    )
                                ) : (
                                    <div className="sol-empty-slot" />
                                )}
                            </div>

                            <div className="sol-spacer" />

                            {/* Fondations */}
                            {[0, 1, 2, 3].map(f => (
                                <div
                                    key={f}
                                    className="sol-foundation"
                                    onDragOver={e => e.preventDefault()}
                                    onDrop={() => handleDropOnFoundation(f)}
                                >
                                    {foundations[f] >= 0 ? (
                                        <div className="sol-card sol-card--svg">
                                            <svg viewBox="0 0 169.075 244.640" width="100%" height="100%">
                                                <use href={`/svg-cards.svg#${
                                                    ['spade', 'heart', 'diamond', 'club'][foundationSuits[f]]
                                                }_${
                                                    ['1','2','3','4','5','6','7','8','9','10','jack','queen','king'][foundations[f]]
                                                }`} x="0" y="0" />
                                            </svg>
                                        </div>
                                    ) : (
                                        <div className="sol-foundation__empty">
                                            {['♠', '♥', '♦', '♣'][f]}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Tableau */}
                        <div className="sol-tableau">
                            {tableau.map((col, colIdx) => {
                                const isMobile = window.innerWidth < 560
                                const faceUpOff = isMobile ? 14 : 22
                                const faceDownOff = isMobile ? 10 : 16
                                const lastTop = col.length > 0
                                    ? (col[col.length - 1].faceUp
                                        ? (col.length - 1) * faceUpOff
                                        : (col.length - 1) * faceDownOff)
                                    : 0
                                return (
                                <div
                                    key={colIdx}
                                    className="sol-column"
                                    style={col.length > 0 ? {
                                        height: `calc(var(--sol-card-h) + ${lastTop}px)`
                                    } : undefined}
                                    onDragOver={e => e.preventDefault()}
                                    onDrop={() => handleDropOnTableau(colIdx)}
                                >
                                    {col.length === 0 ? (
                                        <div className="sol-empty-slot sol-empty-slot--king">
                                            K
                                        </div>
                                    ) : (
                                        col.map((card, cardIdx) => (
                                            card.faceUp
                                                ? renderCard(
                                                    card,
                                                    `col-${colIdx}-${cardIdx}`,
                                                    true,
                                                    () => handleDragStart('tableau', colIdx, cardIdx),
                                                    cardIdx === col.length - 1
                                                        ? () => handleTableauDoubleClick(colIdx)
                                                        : undefined,
                                                    {
                                                        top: `${cardIdx * (window.innerWidth < 560 ? 14 : 22)}px`
                                                    }
                                                )
                                                : renderCardBack(
                                                    `col-${colIdx}-${cardIdx}-back`,
                                                    {
                                                        top: `${cardIdx * (window.innerWidth < 560 ? 10 : 16)}px`
                                                    }
                                                )
                                        ))
                                    )}
                                </div>
                                )
                            })}
                        </div>

                    </div>
                )}

            </section>
        </main>
    )
}

export default Solitaire
