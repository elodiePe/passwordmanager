import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import fs from 'node:fs'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function generateDuplicateIndexHtmlPlugin() {
  return {
    name: 'duplicate-index-html',
    apply: 'build',
    buildStart() {
      const distPath = path.resolve(__dirname, 'dist')
      if (fs.existsSync(distPath)) {
        fs.rmSync(distPath, { recursive: true, force: true })
      }
    },
    writeBundle() {
      const indexPath = path.resolve(__dirname, 'dist', 'index.html')
      // Only pre-generate static routes
      const staticRoutes = ['', '/settings', '/newpassword']

      staticRoutes.forEach((route) => {
        const cleanRoute = route === '' ? '' : route.replace(/^\//, '')
        const routeDir = path.resolve(__dirname, 'dist', cleanRoute)
        if (!fs.existsSync(routeDir)) {
          fs.mkdirSync(routeDir, { recursive: true })
        }
        fs.copyFileSync(indexPath, path.resolve(routeDir, 'index.html'))
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    generateDuplicateIndexHtmlPlugin(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  base: '/passwordmanager/',
})
