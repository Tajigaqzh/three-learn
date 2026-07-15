import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/]react/,
              minSize: 100000,
              maxSize: 250000,
              priority: 30,
            },
            {
              name: 'three-vendor',
              test: /node_modules[\\/]three/,
              minSize: 100000,
              maxSize: 250000,
              priority: 20,
            },
            {
              name: 'vendor',
              test: /node_modules/,
              minSize: 100000,
              maxSize: 250000,
              priority: 10,
            },
            {
              name: 'common',
              minShareCount: 2,
              minSize: 10000,
              priority: 5,
            },
          ],
        },
      },
    },
  },
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
});
