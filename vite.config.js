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
      const routes = ['/', '/settings', '/newpassword']

      routes.forEach((route) => {
        const cleanRoute = route.replace(/^\//, '')
        const routeDir = path.resolve(__dirname, 'dist', cleanRoute)
        if (!fs.existsSync(routeDir)) {
          fs.mkdirSync(routeDir, { recursive: true })
        }
        fs.copyFileSync(indexPath, path.resolve(routeDir, 'index.html'))
      })

      const public404 = path.resolve(__dirname, 'public', '404.html')
      const out404 = path.resolve(__dirname, 'dist', '404.html')
      if (fs.existsSync(public404)) {
        fs.copyFileSync(public404, out404)
      }
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
  base: '/passwordmanager/',
})
