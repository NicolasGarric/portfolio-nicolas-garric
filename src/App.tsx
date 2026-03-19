import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Contact from './pages/Contact'
import Snake from './pages/Snake'
import Breakout from './pages/Breakout'
import Header from './components/Header'
import Footer from './components/Footer'
import './styles/App.css'

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
            </Routes>

            {/* Footer toujours visible en bas */}
            <Footer />
        </BrowserRouter>
    )
}

export default App
