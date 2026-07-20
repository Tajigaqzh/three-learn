import { defineConfig, type Plugin } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { createRequire } from 'node:module';
import { fileURLToPath, URL } from 'node:url';

type CompressionPluginOptions = {
  algorithm?: 'gzip' | 'brotliCompress' | 'deflate' | 'deflateRaw';
  ext?: string;
  threshold?: number;
};

const require = createRequire(import.meta.url);
const createCompressionPlugin = require('vite-plugin-compression') as (
  options?: CompressionPluginOptions,
) => Plugin;

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'three-vendor',
              test: /node_modules[\\/]three/,
              priority: 10,
            },
          ],
        },
        minify:
          command === 'build'
            ? {
                compress: {
                  dropConsole: true,
                  dropDebugger: true,
                },
              }
            : undefined,
      },
    },
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    command === 'build' &&
      createCompressionPlugin({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 10240,
      }),
  ],
}));
