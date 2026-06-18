import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
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
    port: 5173 // Enforces frontend onto https://localhost:5173
  },
})
