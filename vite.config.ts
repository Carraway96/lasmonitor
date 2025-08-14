import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/lasmonitor/',   // ← viktigt: ditt repo-namn
})
