import { useEffect, useRef, useState, useCallback } from 'react'
import { useScore } from '../hooks/useScore'
import './Solitaire.css'
import init, * as SolitaireWasmModule from '../wasm/solitaire/solitaire.js'

interface CardData {
    suit: number
    rank: number
    faceUp: boolean
}

interface DragState {
    source: 'waste' | 'tableau'
    col?: number
    cardIdx?: number
    startX: number
    startY: number
    currentX: number
    currentY: number
    active: boolean
}

interface SelectedCard {
    source: 'waste' | 'tableau'
    col?: number
    cardIdx?: number
}

const SUIT_NAMES = ['spade', 'heart', 'diamond', 'club']
const RANK_NAMES = ['1','2','3','4','5','6','7','8','9','10','jack','queen','king']

function Solitaire() {
    const { saveScore } = useScore()
    const gameRef = useRef<any>(null)
    const [wasmReady, setWasmReady] = useState(false)
    const [started, setStarted] = useState(false)
    const [won, setWon] = useState(false)
    const [autoCompleting, setAutoCompleting] = useState(false)

    const [tableau, setTableau] = useState<CardData[][]>([])
    const [wasteTop, setWasteTop] = useState<CardData | null>(null)
    const [stockCount, setStockCount] = useState(0)
    const [foundations, setFoundations] = useState<number[]>([-1, -1, -1, -1])
    const [foundationSuits, setFoundationSuits] = useState<number[]>([-1, -1, -1, -1])
    const [moves, setMoves] = useState(0)

    const [drag, setDrag] = useState<DragState | null>(null)
    const dragRef = useRef<DragState | null>(null)
    const [selected, setSelected] = useState<SelectedCard | null>(null)
    const lastTapRef = useRef<{ time: number; source: string } | null>(null)

    useEffect(() => {
        init().then(() => {
            ;(window as any).SolitaireWasm = SolitaireWasmModule
            setWasmReady(true)
        })
    }, [])

    const syncState = useCallback(() => {
        if (!gameRef.current) return
        const raw = gameRef.current.get_tableau()
        const cols: CardData[][] = []
        let i = 0
        for (let col = 0; col < 7; col++) {
            const count = raw[i++]
            const cards: CardData[] = []
            for (let c = 0; c < count; c++) {
                cards.push({ suit: raw[i++], rank: raw[i++], faceUp: raw[i++] === 1 })
            }
            cols.push(cards)
        }
        setTableau(cols)
        const waste = gameRef.current.get_waste_top()
        setWasteTop(waste.length > 0 ? { suit: waste[0], rank: waste[1], faceUp: true } : null)
        setStockCount(gameRef.current.get_stock_count())
        setFoundations(Array.from(gameRef.current.get_foundations()))
        setFoundationSuits(Array.from(gameRef.current.get_foundation_suits()))
        setMoves(gameRef.current.get_moves())
        if (gameRef.current.is_won()) {
            setWon(true)
            saveScore('solitaire', gameRef.current.get_moves())
        }
    }, [saveScore])

    const startGame = () => {
        const wasm = (window as any).SolitaireWasm
        if (!wasm) return
        gameRef.current = wasm.GameState.new(Date.now())
        setWon(false)
        setDrag(null)
        dragRef.current = null
        setSelected(null)
        setAutoCompleting(false)
        syncState()
        setStarted(true)
    }

    const handleStockClick = () => {
        if (!gameRef.current) return
        gameRef.current.draw_from_stock()
        syncState()
    }

    // ===== AUTO-COMPLETE =====
    const runAutoComplete = useCallback(() => {
        if (!gameRef.current) return
        setAutoCompleting(true)
        const interval = setInterval(() => {
            if (!gameRef.current) { clearInterval(interval); return }
            let moved = false
            if (gameRef.current.auto_move_waste_to_foundation()) moved = true
            if (!moved) {
                for (let col = 0; col < 7; col++) {
                    if (gameRef.current.auto_move_to_foundation(col)) { moved = true; break }
                }
            }
            if (moved) {
                syncState()
            } else {
                clearInterval(interval)
                setAutoCompleting(false)
            }
        }, 120)
    }, [syncState])

    const canAutoComplete = useCallback(() => {
        if (!tableau.length) return false
        return tableau.every(col => col.every(card => card.faceUp)) && stockCount === 0 && !wasteTop
    }, [tableau, stockCount, wasteTop])

    // ===== DOUBLE TAP =====
    const handleDoubleTap = (source: 'waste' | 'tableau', col?: number) => {
        if (!gameRef.current) return
        if (source === 'waste') {
            gameRef.current.auto_move_waste_to_foundation()
        } else if (col !== undefined) {
            gameRef.current.auto_move_to_foundation(col)
        }
        setSelected(null)
        syncState()
    }

    const checkDoubleTap = (key: string, source: 'waste' | 'tableau', col?: number): boolean => {
        const now = Date.now()
        const last = lastTapRef.current
        if (last && last.source === key && now - last.time < 350) {
            lastTapRef.current = null
            handleDoubleTap(source, col)
            return true
        }
        lastTapRef.current = { time: now, source: key }
        return false
    }

    // ===== TAP =====
    const handleTap = (source: 'waste' | 'tableau', col?: number, cardIdx?: number) => {
        const key = `${source}-${col}-${cardIdx}`
        if (checkDoubleTap(key, source, col)) return

        if (!selected) {
            setSelected({ source, col, cardIdx })
            return
        }
        if (selected.source === source && selected.col === col && selected.cardIdx === cardIdx) {
            setSelected(null)
            return
        }
        if (!gameRef.current) return
        let moved = false
        if (source === 'tableau' && col !== undefined) {
            if (selected.source === 'waste') {
                moved = gameRef.current.move_waste_to_tableau(col)
            } else if (selected.source === 'tableau' && selected.col !== undefined && selected.cardIdx !== undefined) {
                moved = gameRef.current.move_tableau_to_tableau(selected.col, selected.cardIdx, col)
            }
        }
        setSelected(null)
        if (moved) syncState()
        else setSelected({ source, col, cardIdx })
    }

    // ===== POINTER DRAG =====
    const handlePointerDown = (
        e: React.PointerEvent,
        source: 'waste' | 'tableau',
        col?: number,
        cardIdx?: number
    ) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return
        e.currentTarget.setPointerCapture(e.pointerId)
        const state: DragState = {
            source, col, cardIdx,
            startX: e.clientX, startY: e.clientY,
            currentX: e.clientX, currentY: e.clientY,
            active: false,
        }
        dragRef.current = state
        setDrag({ ...state })
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!dragRef.current) return
        const dx = e.clientX - dragRef.current.startX
        const dy = e.clientY - dragRef.current.startY
        const dist = Math.sqrt(dx * dx + dy * dy)
        const updated: DragState = {
            ...dragRef.current,
            currentX: e.clientX,
            currentY: e.clientY,
            active: dist > 8,
        }
        dragRef.current = updated
        if (updated.active) setDrag({ ...updated })
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        const current = dragRef.current
        dragRef.current = null
        setDrag(null)
        if (!current || !current.active) {
            handleTap(current?.source ?? 'waste', current?.col, current?.cardIdx)
            return
        }
        const el = document.elementFromPoint(e.clientX, e.clientY)
        if (!el || !gameRef.current) return
        const target = el.closest('[data-drop-col]') as HTMLElement | null
        const targetFoundation = el.closest('[data-drop-foundation]') as HTMLElement | null
        if (target) {
            const toCol = parseInt(target.dataset.dropCol!)
            if (current.source === 'waste') {
                gameRef.current.move_waste_to_tableau(toCol)
            } else if (current.source === 'tableau' && current.col !== undefined && current.cardIdx !== undefined) {
                gameRef.current.move_tableau_to_tableau(current.col, current.cardIdx, toCol)
            }
            syncState()
        } else if (targetFoundation) {
            const f = parseInt(targetFoundation.dataset.dropFoundation!)
            if (current.source === 'waste') {
                gameRef.current.move_waste_to_foundation(f)
            } else if (current.source === 'tableau' && current.col !== undefined) {
                gameRef.current.move_tableau_to_foundation(current.col, f)
            }
            syncState()
        }
    }

    const isSelected = (source: 'waste' | 'tableau', col?: number, cardIdx?: number) =>
        selected?.source === source && selected?.col === col && selected?.cardIdx === cardIdx

    const isDragging = (source: 'waste' | 'tableau', col?: number, cardIdx?: number) =>
        drag?.active && drag.source === source && drag.col === col && drag.cardIdx === cardIdx

    const renderSVGCard = (card: CardData) => (
        <svg viewBox="0 0 169.075 244.640" width="100%" height="100%">
            <use href={`/svg-cards.svg#${SUIT_NAMES[card.suit]}_${RANK_NAMES[card.rank]}`} x="0" y="0" />
        </svg>
    )

    const renderBack = () => (
        <svg viewBox="0 0 169.075 244.640" width="100%" height="100%">
            <use href="/svg-cards.svg#back" x="0" y="0" />
        </svg>
    )

    const renderDragGhost = () => {
        if (!drag?.active) return null
        const isMobile = window.innerWidth < 560
        const w = isMobile ? 36 : 80
        const h = isMobile ? 50 : 112
        let card: CardData | null = null
        if (drag.source === 'waste' && wasteTop) card = wasteTop
        else if (drag.source === 'tableau' && drag.col !== undefined && drag.cardIdx !== undefined) {
            card = tableau[drag.col]?.[drag.cardIdx] ?? null
        }
        if (!card) return null
        return (
            <div style={{
                position: 'fixed',
                left: drag.currentX - w / 2,
                top: drag.currentY - h / 2,
                width: w, height: h,
                pointerEvents: 'none',
                zIndex: 9999,
                opacity: 0.85,
                transform: 'rotate(3deg)',
                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.6))',
            }}>
                <svg viewBox="0 0 169.075 244.640" width="100%" height="100%">
                    <use href={`/svg-cards.svg#${SUIT_NAMES[card.suit]}_${RANK_NAMES[card.rank]}`} x="0" y="0" />
                </svg>
            </div>
        )
    }

    return (
        <main className="page" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
            <section className="sol-page">

                <div className="sol-header">
                    <h1 className="sol-title">🃏 Solitaire</h1>
                    {started && (
                        <div className="sol-stats">
                            <span className="sol-stat">🔄 {moves} mouvements</span>
                            {canAutoComplete() && !autoCompleting && (
                                <button className="sol-autocomplete-btn" onClick={runAutoComplete}>
                                    ✨ Terminer
                                </button>
                            )}
                            <button className="sol-new-game" onClick={startGame}>
                                Nouvelle partie
                            </button>
                        </div>
                    )}
                </div>

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
                            <p>Double-tap/clic pour envoyer en fondation</p>
                            <p>Glisser-déposer pour déplacer</p>
                        </div>
                        <button className="sol-btn" onClick={startGame} disabled={!wasmReady}>
                            {wasmReady ? 'Jouer' : 'Chargement...'}
                        </button>
                    </div>
                )}

                {won && (
                    <div className="sol-overlay sol-overlay--won">
                        <p className="sol-overlay__emoji">🎉</p>
                        <h2 className="sol-overlay__title">Bravo !</h2>
                        <p className="sol-overlay__score">{moves} coups</p>
                        <p className="sol-overlay__text">Partie terminée !</p>
                        <button className="sol-btn" onClick={startGame}>Rejouer</button>
                    </div>
                )}

                {started && !won && (
                    <div className="sol-game">
                        <div className="sol-top">

                            <div className="sol-stock" onClick={handleStockClick}>
                                {stockCount > 0 ? (
                                    <div className="sol-card" style={{ position: 'relative' }}>
                                        {renderBack()}
                                        <span className="sol-stock__count">{stockCount}</span>
                                    </div>
                                ) : (
                                    <div className="sol-stock--empty">↺</div>
                                )}
                            </div>

                            <div className="sol-waste">
                                {wasteTop ? (
                                    <div
                                        className={`sol-card sol-card--svg sol-card--draggable
                                            ${isSelected('waste') ? 'sol-card--selected' : ''}
                                            ${isDragging('waste') ? 'sol-card--dragging' : ''}
                                        `}
                                        onPointerDown={e => handlePointerDown(e, 'waste')}
                                        onDoubleClick={() => handleDoubleTap('waste')}
                                        style={{ touchAction: 'none' }}
                                    >
                                        {renderSVGCard(wasteTop)}
                                    </div>
                                ) : (
                                    <div className="sol-empty-slot" />
                                )}
                            </div>

                            <div className="sol-spacer" />

                            {[0, 1, 2, 3].map(f => (
                                <div
                                    key={f}
                                    className="sol-foundation"
                                    data-drop-foundation={f}
                                >
                                    {foundations[f] >= 0 ? (
                                        <div className={`sol-card sol-card--svg ${autoCompleting ? 'sol-card--autocomplete' : ''}`}>
                                            <svg viewBox="0 0 169.075 244.640" width="100%" height="100%">
                                                <use href={`/svg-cards.svg#${SUIT_NAMES[foundationSuits[f]]}_${RANK_NAMES[foundations[f]]}`} x="0" y="0" />
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
                                        data-drop-col={colIdx}
                                        style={col.length > 0 ? {
                                            height: `calc(var(--sol-card-h) + ${lastTop}px)`
                                        } : undefined}
                                    >
                                        {col.length === 0 ? (
                                            <div className="sol-empty-slot sol-empty-slot--king">K</div>
                                        ) : (
                                            col.map((card, cardIdx) => (
                                                card.faceUp ? (
                                                    <div
                                                        key={`col-${colIdx}-${cardIdx}`}
                                                        className={`sol-card sol-card--svg sol-card--draggable
                                                            ${isSelected('tableau', colIdx, cardIdx) ? 'sol-card--selected' : ''}
                                                            ${isDragging('tableau', colIdx, cardIdx) ? 'sol-card--dragging' : ''}
                                                        `}
                                                        style={{
                                                            top: `${cardIdx * (isMobile ? 14 : 22)}px`,
                                                            touchAction: 'none',
                                                        }}
                                                        onPointerDown={e => handlePointerDown(e, 'tableau', colIdx, cardIdx)}
                                                        onDoubleClick={cardIdx === col.length - 1
                                                            ? () => handleDoubleTap('tableau', colIdx)
                                                            : undefined}
                                                    >
                                                        {renderSVGCard(card)}
                                                    </div>
                                                ) : (
                                                    <div
                                                        key={`col-${colIdx}-${cardIdx}-back`}
                                                        className="sol-card sol-card--svg"
                                                        style={{ top: `${cardIdx * (isMobile ? 10 : 16)}px` }}
                                                    >
                                                        {renderBack()}
                                                    </div>
                                                )
                                            ))
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {renderDragGhost()}

            </section>
        </main>
    )
}

export default Solitaire
