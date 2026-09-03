import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/motion')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/lucide-react') || id.includes('node_modules/canvas-confetti')) {
              return 'vendor-ui';
            }
          }
        }
      }
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: [
          '**/server/data/**',
          '**/server/**',
          '**/*.db',
          '**/*.db-wal',
          '**/*.db-shm',
          '**/.git/**',
          '**/node_modules/**'
        ]
      },
    },
  };
});
