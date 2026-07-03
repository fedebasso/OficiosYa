import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  cacheDir: '.vite-cache',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/node_modules\/(react|react-dom|react-router|scheduler)\//.test(id)) return 'react-vendor'
          if (id.includes('node_modules/@supabase/')) return 'supabase'
          if (/node_modules\/(react-hook-form|@hookform|zod)\//.test(id)) return 'forms'
          // Agrupar íconos en un chunk en vez de ~40 chunks diminutos (mejor en 4G)
          if (id.includes('node_modules/lucide-react')) return 'icons'
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion')) return 'motion'
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'OFIX',
        short_name: 'OFIX',
        description: 'Encontrá profesionales de confianza en Montevideo',
        theme_color: '#F5F0E8',
        background_color: '#F5F0E8',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icon-192.png',         sizes: '192x192',   type: 'image/png',    purpose: 'any' },
          { src: '/icon-512.png',         sizes: '512x512',   type: 'image/png',    purpose: 'any maskable' },
          { src: '/icon-1024.png',        sizes: '1024x1024', type: 'image/png',    purpose: 'any' },
          { src: '/apple-touch-icon.png', sizes: '180x180',   type: 'image/png',    purpose: 'any' },
          { src: '/ofix-icon.svg',        sizes: 'any',       type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        importScripts: ['sw-push.js'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'supabase-cache' },
          },
        ],
      },
    }),
  ],
})
