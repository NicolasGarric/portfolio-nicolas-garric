import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Country } from '../data/countries'
import { ALL_COUNTRIES, PLAYABLE_COUNTRIES, haversineDistance, getTemperature } from '../data/countries'
import { useScore } from '../hooks/useScore'
import './FoodGuessr.css'

// Fix icônes Leaflet avec Vite
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const TOTAL_ROUNDS = 10

interface Meal {
    idMeal: string
    strMeal: string
    strMealThumb: string
    strArea: string
}

interface Guess {
    country: Country
    distance: number
    temperature: { label: string; emoji: string; color: string }
    correct: boolean
}

// Composant qui zoom sur un pays quand il est trouvé
function MapController({ center, zoom }: { center: [number, number] | null; zoom: number }) {
    const map = useMap()
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom, { duration: 1.5 })
        }
    }, [center, zoom])
    return null
}

// Icône colorée pour les pins
function createColoredIcon(color: string) {
    return L.divIcon({
        className: '',
        html: `<div style="
            width: 20px; height: 20px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.5);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    })
}

function FoodGuessr() {
    const { saveScore } = useScore()

    const gameRef = useRef<any>(null)
    const [wasmReady, setWasmReady] = useState(false)
    const [started, setStarted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [gameOver, setGameOver] = useState(false)

    const [meals, setMeals] = useState<Meal[]>([])
    const [currentRound, setCurrentRound] = useState(0)
    const [currentMeal, setCurrentMeal] = useState<Meal | null>(null)
    const [guesses, setGuesses] = useState<Guess[]>([])
    const [roundOver, setRoundOver] = useState(false)
    const [correctCountry, setCorrectCountry] = useState<Country | null>(null)

    const [totalScore, setTotalScore] = useState(0)
    const [roundScore, setRoundScore] = useState(0)
    const [potentialScore, setPotentialScore] = useState(1000)

    const [input, setInput] = useState('')
    const [suggestions, setSuggestions] = useState<Country[]>([])
    const [mapCenter, setMapCenter] = useState<[number, number] | null>(null)
    const [mapZoom, setMapZoom] = useState(2)
    const [error, setError] = useState('')

    // Charge le WASM
    useEffect(() => {
        const script = document.createElement('script')
        script.type = 'module'
        script.innerHTML = `
            import init, * as FoodGuessrWasm from '/food-guessr-wasm/food_guessr.js';
            await init();
            window.FoodGuessrWasm = FoodGuessrWasm;
            window.dispatchEvent(new Event('food-guessr-wasm-ready'));
        `
        document.head.appendChild(script)
        window.addEventListener('food-guessr-wasm-ready', () => setWasmReady(true), { once: true })
    }, [])

    // Récupère les plats depuis TheMealDB
    const fetchMeals = async () => {
        setLoading(true)
        try {
            const fetched: Meal[] = []
            const usedAreas = new Set<string>()

            // Récupère des plats aléatoires depuis des pays différents
            let attempts = 0
            while (fetched.length < TOTAL_ROUNDS && attempts < 50) {
                attempts++
                const res = await fetch('https://www.themealdb.com/api/json/v1/1/random.php')
                const data = await res.json()
                const meal: Meal = data.meals[0]

                // Vérifie que le pays est dans notre liste et pas déjà utilisé
                const country = PLAYABLE_COUNTRIES.find(c => c.mealdbArea === meal.strArea)
                if (country && !usedAreas.has(meal.strArea)) {
                    usedAreas.add(meal.strArea)
                    fetched.push(meal)
                }
            }

            if (fetched.length < TOTAL_ROUNDS) {
                throw new Error('Pas assez de plats récupérés')
            }

            setMeals(fetched)
            setLoading(false)
            return fetched
        } catch (err) {
            setError('Erreur lors du chargement des plats. Réessaie.')
            setLoading(false)
            return null
        }
    }

    // Démarre le jeu
    const startGame = async () => {
        const wasm = (window as any).FoodGuessrWasm
        if (!wasm) return

        const fetchedMeals = await fetchMeals()
        if (!fetchedMeals) return

        gameRef.current = wasm.GameState.new(Date.now())

        setCurrentRound(0)
        setTotalScore(0)
        setRoundScore(0)
        setPotentialScore(1000)
        setGuesses([])
        setRoundOver(false)
        setGameOver(false)
        setCorrectCountry(null)
        setMapCenter(null)
        setMapZoom(2)
        setInput('')
        setCurrentMeal(fetchedMeals[0])
        setStarted(true)
    }

    // Autocomplétion
    const handleInput = (value: string) => {
        setInput(value)
        if (value.length < 2) {
            setSuggestions([])
            return
        }
        // Autocomplétion sur TOUS les pays
        const filtered = ALL_COUNTRIES.filter(c =>
            c.name.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 6)
        setSuggestions(filtered)
    }

    // Soumet une réponse
    const handleGuess = (country: Country) => {
        if (!gameRef.current || roundOver || !currentMeal) return

        setInput('')
        setSuggestions([])

        const correctC = PLAYABLE_COUNTRIES.find(c => c.mealdbArea === currentMeal.strArea)
        if (!correctC) return

        const isCorrect = country.name === correctC.name
        const distance = haversineDistance(country.lat, country.lng, correctC.lat, correctC.lng)
        const temp = isCorrect
            ? { label: 'Correct !', emoji: '✅', color: '#51cf66' }
            : getTemperature(distance)

        // Fix — passe 1 ou 0 au lieu de true/false
        const score = gameRef.current.submit_answer(isCorrect ? 1 : 0)
        const newTotal = gameRef.current.get_total_score()
        const potential = gameRef.current.get_potential_score()

        const newGuess: Guess = { country, distance, temperature: temp, correct: isCorrect }
        setGuesses(prev => [...prev, newGuess])
        setTotalScore(newTotal)
        setPotentialScore(potential)

        setMapCenter([country.lat, country.lng])
        setMapZoom(4)

        if (isCorrect) {
            setRoundScore(score)
            setRoundOver(true)
            setCorrectCountry(correctC)
            setTimeout(() => {
                setMapCenter([correctC.lat, correctC.lng])
                setMapZoom(5)
            }, 800)
        }
    }

    const handleSkip = () => {
        if (!gameRef.current || roundOver || !currentMeal) return

        const correctC = PLAYABLE_COUNTRIES.find(c => c.mealdbArea === currentMeal.strArea)
        if (!correctC) return

        // Soumet une mauvaise réponse pour avancer sans points
        gameRef.current.submit_answer(0)
        setRoundScore(0)
        setRoundOver(true)
        setCorrectCountry(correctC)
        setMapCenter([correctC.lat, correctC.lng])
        setMapZoom(5)
    }

    // Round suivant
    const handleNextRound = () => {
        if (!gameRef.current) return

        gameRef.current.next_round()

        if (gameRef.current.is_game_over()) {
            setGameOver(true)
            saveScore('food-guessr', gameRef.current.get_total_score())
            return
        }

        const nextRound = currentRound + 1
        setCurrentRound(nextRound)
        setCurrentMeal(meals[nextRound])
        setGuesses([])
        setRoundOver(false)
        setCorrectCountry(null)
        setRoundScore(0)
        setPotentialScore(1000)
        setMapCenter(null)
        setMapZoom(2)
        setInput('')
    }

    return (
        <main className="page">
            <section className="fg-page">

                {/* Header */}
                <div className="fg-header">
                    <h1 className="fg-title">🍜 FoodGuessr</h1>
                    {started && !gameOver && (
                        <div className="fg-stats">
                            <span className="fg-stat">
                                🍽️ Round {currentRound + 1} / {TOTAL_ROUNDS}
                            </span>
                            <span className="fg-stat fg-stat--score">
                                ⭐ {totalScore} pts
                            </span>
                            <span className="fg-stat fg-stat--potential">
                                🎯 Gain potentiel : {potentialScore} pts
                            </span>
                        </div>
                    )}
                </div>

                {/* Écran d'accueil */}
                {!started && !loading && (
                    <div className="fg-overlay">
                        <p className="fg-overlay__emoji">🍜</p>
                        <h2 className="fg-overlay__title">FoodGuessr</h2>
                        <p className="fg-overlay__text">
                            Découvre un plat et devine de quel pays il vient !
                        </p>
                        <p className="fg-overlay__text">
                            {TOTAL_ROUNDS} rounds — score dégressif à chaque tentative
                        </p>
                        <div className="fg-temp-legend">
                            <span style={{ color: '#ff4444' }}>🔴 Très chaud &lt; 500km</span>
                            <span style={{ color: '#ff922b' }}>🟠 Chaud &lt; 1500km</span>
                            <span style={{ color: '#ffd43b' }}>🟡 Tiède &lt; 3000km</span>
                            <span style={{ color: '#339af0' }}>🔵 Froid &lt; 5000km</span>
                            <span style={{ color: '#74c0fc' }}>❄️ Très froid &gt; 5000km</span>
                        </div>
                        {error && <p className="fg-error">{error}</p>}
                        <button
                            className="fg-btn"
                            onClick={startGame}
                            disabled={!wasmReady}
                        >
                            {wasmReady ? 'Jouer' : 'Chargement...'}
                        </button>
                    </div>
                )}

                {/* Chargement */}
                {loading && (
                    <div className="fg-overlay">
                        <p className="fg-overlay__emoji">🔭</p>
                        <h2 className="fg-overlay__title">Chargement des plats...</h2>
                        <div className="fg-loader" />
                    </div>
                )}

                {/* Jeu */}
                {started && !loading && !gameOver && currentMeal && (
                    <div className="fg-game">

                        {/* Colonne gauche — plat + input */}
                        <div className="fg-left">

                            {/* Image du plat */}
                            <div className="fg-meal-card">
                                <img
                                    src={currentMeal.strMealThumb}
                                    alt={currentMeal.strMeal}
                                    className="fg-meal-image"
                                />
                                <div className="fg-meal-info">
                                    <h2 className="fg-meal-name">{currentMeal.strMeal}</h2>
                                    <p className="fg-meal-hint">
                                        De quel pays vient ce plat ?
                                    </p>
                                </div>
                            </div>

                            {/* Input avec autocomplétion */}
                            {!roundOver && (
                                <div className="fg-input-wrapper">
                                    <input
                                        className="fg-input"
                                        type="text"
                                        value={input}
                                        onChange={e => handleInput(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && suggestions.length > 0) {
                                                handleGuess(suggestions[0])
                                            }
                                        }}
                                        placeholder="Tape un pays..."
                                        autoComplete="off"
                                    />
                                    {suggestions.length > 0 && (
                                        <div className="fg-suggestions">
                                            {suggestions.map(country => (
                                                <button
                                                    key={country.name}
                                                    className="fg-suggestion"
                                                    onClick={() => handleGuess(country)}
                                                >
                                                    {country.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {!roundOver && (
                                <button
                                    className="fg-skip-btn"
                                    onClick={handleSkip}
                                >
                                    Passer →
                                </button>
                            )}

                            {/* Résultat du round */}
                            {roundOver && correctCountry && (
                                <div className="fg-round-result">
                                    <p className="fg-round-result__correct">
                                        ✅ C'était : <strong>{correctCountry.name}</strong>
                                    </p>
                                    <p className="fg-round-result__score">
                                        +{roundScore} points
                                    </p>
                                    <button className="fg-btn" onClick={handleNextRound}>
                                        {currentRound + 1 >= TOTAL_ROUNDS
                                            ? 'Voir le score final'
                                            : 'Plat suivant →'}
                                    </button>
                                </div>
                            )}

                            {/* Historique des tentatives */}
                            {guesses.length > 0 && (
                                <div className="fg-guesses">
                                    <h3 className="fg-guesses__title">Tes tentatives</h3>
                                    {guesses.map((guess, i) => (
                                        <div key={i} className="fg-guess-item">
                                            <span
                                                className="fg-guess-temp"
                                                style={{ color: guess.temperature.color }}
                                            >
                                                {guess.temperature.emoji} {guess.temperature.label}
                                            </span>
                                            <span className="fg-guess-country">
                                                {guess.country.name}
                                            </span>
                                            {!guess.correct && (
                                                <span className="fg-guess-distance">
                                                    {Math.round(guess.distance)} km
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Colonne droite — carte */}
                        <div className="fg-map-wrapper">
                            <MapContainer
                                center={[20, 0]}
                                zoom={2}
                                className="fg-map"
                                scrollWheelZoom={false}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; OpenStreetMap contributors'
                                />
                                <MapController center={mapCenter} zoom={mapZoom} />

                                {/* Pins des tentatives */}
                                {guesses.map((guess, i) => (
                                    <Marker
                                        key={i}
                                        position={[guess.country.lat, guess.country.lng]}
                                        icon={createColoredIcon(guess.temperature.color)}
                                    >
                                        <Popup>
                                            <strong>{guess.country.name}</strong><br />
                                            {guess.temperature.emoji} {guess.temperature.label}
                                            {!guess.correct && ` — ${Math.round(guess.distance)} km`}
                                        </Popup>
                                    </Marker>
                                ))}

                                {/* Pin du bon pays */}
                                {roundOver && correctCountry && (
                                    <Marker
                                        position={[correctCountry.lat, correctCountry.lng]}
                                        icon={createColoredIcon('#51cf66')}
                                    >
                                        <Popup>
                                            <strong>✅ {correctCountry.name}</strong>
                                        </Popup>
                                    </Marker>
                                )}
                            </MapContainer>
                        </div>
                    </div>
                )}

                {/* Game Over */}
                {gameOver && (
                    <div className="fg-overlay fg-overlay--gameover">
                        <p className="fg-overlay__emoji">🏆</p>
                        <h2 className="fg-overlay__title">Quiz terminé !</h2>
                        <p className="fg-score-final">{totalScore} pts</p>
                        <p className="fg-overlay__text">
                            {totalScore >= 8000
                                ? '🌟 Master Chef du monde !'
                                : totalScore >= 5000
                                ? '👨‍🍳 Excellent géographe !'
                                : '🍽️ Continue à explorer la carte !'}
                        </p>
                        <button className="fg-btn" onClick={startGame}>
                            Rejouer
                        </button>
                    </div>
                )}

            </section>
        </main>
    )
}

export default FoodGuessr
