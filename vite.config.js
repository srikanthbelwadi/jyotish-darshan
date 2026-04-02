import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'intercept-swisseph-wasm',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url.includes('swisseph.wasm')) {
            const wasmPath = process.cwd() + '/public/swisseph.wasm';
            const stat = fs.statSync(wasmPath);
            res.writeHead(200, {
              'Content-Type': 'application/wasm',
              'Content-Length': stat.size
            });
            fs.createReadStream(wasmPath).pipe(res);
            return;
          }
          next();
        });
      }
    }
  ],
  server: {
    fs: {
      allow: ['..']
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },

  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          swisseph: ['swisseph-wasm']
        }
      }
    }
  }
})
