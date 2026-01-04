import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4110',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: [
      'beauty.alfares.cz',
      'www.beauty.alfares.cz',
      'localhost',
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // Keep MUI and Emotion together (MUI depends on Emotion)
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'mui-vendor';
            }
            if (id.includes('@tanstack')) {
              return 'query-vendor';
            }
            // Other large vendor libraries
            if (id.includes('axios') || id.includes('date-fns')) {
              return 'utils-vendor';
            }
            // All other node_modules
            return 'vendor';
          }
          // Feature-based chunks for our components
          if (id.includes('/components/pos/')) {
            return 'pos';
          }
          if (id.includes('/components/franchise/')) {
            return 'franchise';
          }
          if (id.includes('/components/public/')) {
            return 'public';
          }
          if (id.includes('/components/auth/')) {
            return 'auth';
          }
        },
      },
    },
    chunkSizeWarningLimit: 300,
    // Use esbuild for minification (default, handles circular deps better)
    minify: 'esbuild',
    // Ensure proper module format
    target: 'esnext',
    modulePreload: {
      polyfill: true,
    },
  },
})

