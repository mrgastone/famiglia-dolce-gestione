import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header.jsx'
import BottomNav from './components/BottomNav.jsx'
import Oggi from './views/Oggi.jsx'
import Settimane from './views/Settimane.jsx'
import Spesa from './views/Spesa.jsx'
import Archivio from './views/Archivio.jsx'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-crema">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-4 pb-32">
        <Routes>
          <Route path="/" element={<Oggi />} />
          <Route path="/settimane" element={<Settimane />} />
          <Route path="/spesa" element={<Spesa />} />
          <Route path="/archivio" element={<Archivio />} />
          {/* Rotta di riserva: torna a "Oggi". Qui in futuro si aggiungeranno
              le rotte dei nuovi moduli (Cassa, Pulizie, ...). */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  )
}
