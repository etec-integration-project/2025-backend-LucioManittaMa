import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://backend:3000', // solo se usa en modo dev local
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
