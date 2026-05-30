import { defineConfig } from 'vite';
import { resolve }      from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: { input: { main: resolve(__dirname, 'index.html') } },
  },
  server: { port: 5173, strictPort: false },
  resolve: {
    alias: {
      '@core':     resolve(__dirname, 'src/core'),
      '@services': resolve(__dirname, 'src/services'),
      '@ui':       resolve(__dirname, 'src/ui'),
      '@modules':  resolve(__dirname, 'src/modules'),
    },
  },
});
