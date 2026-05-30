import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  resolve: {
    alias: {
      '@core':     resolve(__dirname, 'src/core'),
      '@services': resolve(__dirname, 'src/services'),
      '@ui':       resolve(__dirname, 'src/ui'),
      '@data':     resolve(__dirname, 'src/data'),
      '@utils':    resolve(__dirname, 'src/utils'),
      '@config':   resolve(__dirname, 'src/config'),
      '@modules':  resolve(__dirname, 'src/modules'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: { input: 'index.html' },
  },
  server: { port: 5173, strictPort: false },
});