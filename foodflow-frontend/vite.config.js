import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: { // <-- Dodaj ceo ovaj 'resolve' objekat
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
