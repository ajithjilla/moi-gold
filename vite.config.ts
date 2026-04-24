import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_PROXY || 'http://localhost:4000'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: env.VITE_API_URL
        ? undefined
        : {
            '/api': {
              target: apiTarget,
              changeOrigin: true,
            },
            '/health': {
              target: apiTarget,
              changeOrigin: true,
            },
          },
    },
  }
})
