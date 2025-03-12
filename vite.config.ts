import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import postcssNested from 'postcss-nested';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@/': path.join(__dirname, 'src/'),
    },
  },
  css: {
    postcss: {
      plugins: [postcssNested],
    },
  },
  server: {
    port: 4000,
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'index.css') {
            return 'assets/index.css';
          }
          return 'assets/[name].[ext]';
        }
      }
    },
    manifest: true,
  },
  worker: {
    format: 'es',
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});
