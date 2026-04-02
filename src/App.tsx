import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Contact from './pages/Contact'
import Snake from './pages/Snake'
import Breakout from './pages/Breakout'
import Memory from './pages/Memory'
import NasaQuiz from './pages/NasaQuiz'
import TowerDefense from './pages/TowerDefense'
import FoodGuessr from './pages/FoodGuessr'
import Solitaire from './pages/Solitaire'
import Games from './pages/Games'
import Header from './components/Header'
import Footer from './components/Footer'
import Projects from './pages/Projects'
import Upcoming from './pages/Upcoming'
import Login from './pages/Login'
import Register from './pages/Register'
import CookieBanner from './components/CookieBanner'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import './styles/App.css'

function App() {
    return (
        <BrowserRouter>
        <Header />
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/games/snake" element={<Snake />} />
            <Route path="/games/breakout" element={<Breakout />} />
            <Route path="/games/memory" element={<Memory />} />
            <Route path="/games/nasa-quiz" element={<NasaQuiz />} />
            <Route path="/games/tower-defense" element={<TowerDefense />} />
            <Route path="/games/food-guessr" element={<FoodGuessr />} />
            <Route path="/games/solitaire" element={<Solitaire />} />
            <Route path="/games" element={<Games />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/upcoming" element={<Upcoming />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
        </Routes>
        <Footer />
        <CookieBanner />
        </BrowserRouter>
    )
}

export default App
