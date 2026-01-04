import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Optimize React for production
      jsxRuntime: 'automatic',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Ensure proper module resolution
    dedupe: ['react', 'react-dom', '@mui/material', '@emotion/react', '@emotion/styled'],
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
    // Let Vite handle chunking automatically to avoid initialization order issues
    rollupOptions: {
      output: {
        manualChunks: undefined, // Let Vite decide
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit since we're not manually chunking
    // Disable minification to avoid circular dependency issues
    minify: false,
    // Use modern target but ensure compatibility
    target: 'es2020',
    modulePreload: {
      polyfill: true,
    },
    // CommonJS interop for better compatibility
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
})

