import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Contact from './pages/Contact'
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
            </Routes>

            {/* Footer toujours visible en bas */}
            <Footer />
        </BrowserRouter>
    )
}

export default App
