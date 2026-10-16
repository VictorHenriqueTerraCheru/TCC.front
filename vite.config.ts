/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { msw } from 'msw/vite'
import { defineConfig } from 'vite'

import pacote from './package.json' with { type: 'json' }

export default defineConfig(({ command }) => ({
  // msw/vite só serve o mockServiceWorker.js em dev (VITE_USE_MOCKS=true); o build não leva o worker.
  plugins: [react(), tailwindcss(), command === 'serve' && msw({ mode: 'worker-only' })],
  define: { __VERSAO_APP__: JSON.stringify(pacote.version) },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    strictPort: true,
    // Front e API na mesma origem em dev: sem CORS e o túnel HTTPS do celular expõe só esta porta.
    proxy: {
      '/api': 'http://localhost:5080',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
}))
