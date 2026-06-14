import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Base path:
// - in produzione (build/preview) l'app è servita da
//   https://<utente>.github.io/famiglia-dolce-gestione/  → base = '/famiglia-dolce-gestione/'
// - in sviluppo gira comodamente sulla root → base = '/'
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/famiglia-dolce-gestione/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Famiglia Dolce — Colazioni',
        short_name: 'Colazioni',
        description: 'Cruscotto per gestire le colazioni della famiglia',
        lang: 'it',
        dir: 'ltr',
        // percorsi relativi: vengono risolti rispetto al base path del manifest
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FBF7F0',
        theme_color: '#7C9A6B',
        categories: ['food', 'lifestyle'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
}))
