import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Essential for Electron and Cordova/Capacitor to load assets from relative paths
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});