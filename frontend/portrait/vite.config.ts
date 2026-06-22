import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  // 💡 FIX 1: Enforces safe relative file routing for static asset bundles
  base: './',
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../../key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '../../cert.pem')),
    },
    port: 5173 // Enforces frontend dev onto https://localhost:5173
  },
  preview: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../../key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '../../cert.pem')),
    },
    port: 4173 // Enforces production preview onto https://localhost:4173
  }
})
