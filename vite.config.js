import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
