import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function spa404Plugin() {
  return {
    name: 'spa-404',
    apply: 'build' as const,
    closeBundle() {
      const outDir = resolve(__dirname, 'dist');
      const indexPath = resolve(outDir, 'index.html');
      const notFoundPath = resolve(outDir, '404.html');
      if (existsSync(indexPath)) {
        copyFileSync(indexPath, notFoundPath);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/react-zeugma/',
  plugins: [react(), tailwindcss(), spa404Plugin()],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  resolve: {
    alias: {
      'react-zeugma': path.resolve(__dirname, '../src'),
      '@': path.resolve(__dirname, './src'),
    },
  },
});
