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
  
  // --- DODAJ OVAJ BLOK ---
  // Ovo govori Vite-u da svaku referencu na 'global' u kodu
  // zameni sa 'window', što rešava problem sa sockjs-client bibliotekom.
  define: {
    'global': 'window',
  },
  // -------------------------

  server: {
    port: 5173, 
    historyApiFallback: true, 
    proxy: {
      '/api': {
        target: 'http://localhost:8088',
        changeOrigin: true, 
      },
    },
  },
})