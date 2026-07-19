import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath } from 'node:url'

// Base path:
// - in produzione (build/preview) l'app è servita da
//   https://<utente>.github.io/famiglia-dolce-gestione/  → base = '/famiglia-dolce-gestione/'
// - in sviluppo gira comodamente sulla root → base = '/'
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/famiglia-dolce-gestione/' : '/',
  // Due app nello stesso repo: index.html (Colazioni) + cassa.html (Cassa)
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        cassa: fileURLToPath(new URL('./cassa.html', import.meta.url)),
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'icons/apple-touch-icon.png',
        'cassa-icon.svg',
        'icons/cassa-touch-icon.png',
      ],
      // Le due app hanno DUE manifest distinti, scritti a mano in public/ e collegati
      // esplicitamente in index.html e cassa.html:
      //   public/manifest.webmanifest       → Colazioni (start_url ".")
      //   public/cassa.webmanifest          → Cassa     (start_url "cassa.html")
      // Qui il manifest automatico è disattivato: il plugin ne genererebbe uno solo,
      // iniettato in ENTRAMBE le pagine, e su iOS l'icona della Cassa aprirebbe le Colazioni.
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,webmanifest}'],
      },
    }),
  ],
}))
