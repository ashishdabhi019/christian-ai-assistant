import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/hf-api': {
        target: 'https://api-inference.huggingface.co',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/hf-api/, '')
      }
    }
  }
})
