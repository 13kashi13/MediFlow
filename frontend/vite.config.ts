import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy all /auth, /patients, /doctors, etc. to FastAPI backend
      '/auth': 'http://localhost:8000',
      '/patients': 'http://localhost:8000',
      '/doctors': 'http://localhost:8000',
      '/appointments': 'http://localhost:8000',
      '/prescriptions': 'http://localhost:8000',
      '/medical-records': 'http://localhost:8000',
      '/notifications': 'http://localhost:8000',
    },
  },
})
