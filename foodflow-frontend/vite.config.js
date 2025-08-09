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
  // DODAJ SAMO OVAJ DEO
  server: {
    port: 5173, // Opciono, ako želiš da fiksiraš port
    historyApiFallback: true,
  }
})