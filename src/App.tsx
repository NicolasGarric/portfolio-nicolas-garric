import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Contact from './pages/Contact'
import Snake from './pages/Snake'
import Breakout from './pages/Breakout'
import Memory from './pages/Memory'
import Header from './components/Header'
import Footer from './components/Footer'
import Login from './pages/Login'
import Register from './pages/Register'
import './styles/App.css'
import Leaderboard from './pages/Leaderboard'

function App() {
    return (
        <BrowserRouter>
            <Header />

            {/* Le contenu principal change selon l'URL */}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/games/snake" element={<Snake />} />
                <Route path="/games/breakout" element={<Breakout />} />
                <Route path="/games/memory" element={<Memory />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>

            {/* Footer toujours visible en bas */}
            <Footer />
        </BrowserRouter>
    )
}

export default App
