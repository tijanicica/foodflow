// Datoteka: vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  

  server: {
    port: 5173, 
    historyApiFallback: true, 
    proxy: {
      '/api': {
        // === ISPRAVKA JE OVDJE ===
        target: 'http://localhost:8088', // Promijenjeno sa 8080 na 8088
        // ==========================
        changeOrigin: true, 
      },
    },
  },
})