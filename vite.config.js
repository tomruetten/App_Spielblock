import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Repo-Name als Base, damit Assets unter github.io/App_Spielblock/ laden
  base: '/App_Spielblock/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'Spieleblock',
        short_name: 'Spieleblock',
        description: 'Digitale Spielblöcke für Gesellschaftsspiele',
        theme_color: '#6C3CE1',
        background_color: '#0F0A1E',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/App_Spielblock/',
        start_url: '/App_Spielblock/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}']
      }
    })
  ]
})
