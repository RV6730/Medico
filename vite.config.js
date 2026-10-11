import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Medico App',
        short_name: 'Medico',
        description: 'Smart Queue Management System',
        theme_color: '#0A0B14',
        background_color: '#0A0B14',
        display: 'standalone',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3063/3063162.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
