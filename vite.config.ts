import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// The GitHub Pages base path is passed by the deploy workflow (`--base=/<repo>/`); locally it is `/`.
export default defineConfig({
  plugins: [react()],
  define: { __BUILD_ID__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC') },
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            { name: 'three', test: /node_modules[\\/](three|@react-three)[\\/]/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler|zustand)[\\/]/ },
          ],
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
