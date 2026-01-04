import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

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
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunks - let Vite handle MUI automatically to avoid circular deps
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // Don't manually chunk MUI/Emotion - let Vite handle it to avoid initialization issues
            // if (id.includes('@mui') || id.includes('@emotion')) {
            //   return 'mui-vendor';
            // }
            if (id.includes('@tanstack')) {
              return 'query-vendor';
            }
            // Other large vendor libraries
            if (id.includes('axios') || id.includes('date-fns')) {
              return 'utils-vendor';
            }
            // All other node_modules (including MUI/Emotion) go to vendor
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

