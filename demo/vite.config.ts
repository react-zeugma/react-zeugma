import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/react-zeugma/' : '/',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  resolve: {
    alias: {
      'react-zeugma': path.resolve(__dirname, '../src'),
    },
  },
});
