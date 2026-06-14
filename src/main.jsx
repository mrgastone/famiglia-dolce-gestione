import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'

// Font self-hosted (funzionano anche offline, vengono messi in cache dal service
// worker). Solo i sottoinsiemi latino + latino esteso: sufficienti per l'italiano.
import '@fontsource/nunito/latin-400.css'
import '@fontsource/nunito/latin-ext-400.css'
import '@fontsource/nunito/latin-600.css'
import '@fontsource/nunito/latin-ext-600.css'
import '@fontsource/nunito/latin-700.css'
import '@fontsource/nunito/latin-ext-700.css'
import '@fontsource/nunito/latin-800.css'
import '@fontsource/nunito/latin-ext-800.css'
import '@fontsource/fraunces/latin-600.css'
import '@fontsource/fraunces/latin-ext-600.css'
import '@fontsource/fraunces/latin-700.css'
import '@fontsource/fraunces/latin-ext-700.css'

import './index.css'

// HashRouter: massima compatibilità con GitHub Pages (nessun rewrite lato server).
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
