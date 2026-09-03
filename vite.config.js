import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const spaFallbackPlugin = () => ({
  name: 'spa-fallback-plugin',
  closeBundle() {
    try {
      const indexPath = path.resolve(__dirname, 'dist/index.html')
      const fallbackPath = path.resolve(__dirname, 'dist/404.html')
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, fallbackPath)
      }
    } catch (e) {
      console.error('Failed to copy 404.html:', e)
    }
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), spaFallbackPlugin()],
  server: {
    host: true, // Listen on all network interfaces for mobile/local testing
    port: 3000,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/tldraw')) return 'vendor-tldraw';
          if (id.includes('node_modules/react-quill-new') || id.includes('node_modules/dompurify')) return 'vendor-quill';
          if (id.includes('node_modules/recharts')) return 'vendor-charts';
          if (id.includes('node_modules/firebase')) return 'vendor-firebase';
          if (id.includes('node_modules/@dnd-kit')) return 'vendor-dnd';
        }
      }
    }
  }
})
