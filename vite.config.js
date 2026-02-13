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
    async writeBundle() {
      const indexPath = path.resolve(__dirname, 'dist', 'index.html')
      
      // Routes statiques
      const staticRoutes = ['', '/settings', '/newpassword']
      
      staticRoutes.forEach((route) => {
        const cleanRoute = route === '' ? '' : route.replace(/^\//, '')
        const routeDir = path.resolve(__dirname, 'dist', cleanRoute)
        if (!fs.existsSync(routeDir)) {
          fs.mkdirSync(routeDir, { recursive: true })
        }
        fs.copyFileSync(indexPath, path.resolve(routeDir, 'index.html'))
      })

      // Routes dynamiques : récupérer les vrais passwords de l'API
      try {
        const apiBase = 'http://localhost:5000'
        const response = await fetch(`${apiBase}/api/passwords`)
        const passwords = await response.json()

        // Générer pages pour chaque website et account
        passwords.forEach(pwd => {
          if (!pwd || !pwd.website) return
          const website = pwd.website
          const websiteDir = path.resolve(__dirname, 'dist', 'passwords', website)
          if (!fs.existsSync(websiteDir)) {
            fs.mkdirSync(websiteDir, { recursive: true })
          }
          fs.copyFileSync(indexPath, path.resolve(websiteDir, 'index.html'))

          // Générer pages pour chaque account
          if (pwd._id) {
            const accountDir = path.resolve(__dirname, 'dist', 'passwords', website, pwd._id)
            if (!fs.existsSync(accountDir)) {
              fs.mkdirSync(accountDir, { recursive: true })
            }
            fs.copyFileSync(indexPath, path.resolve(accountDir, 'index.html'))
          }
        })

        // Créer fallbacks génériques pour les IDs non pré-générés
        const uniqueWebsites = [...new Set(passwords.map(p => p.website))]
        uniqueWebsites.forEach(website => {
          const fallbackAccountDir = path.resolve(__dirname, 'dist', 'passwords', website, '_id')
          if (!fs.existsSync(fallbackAccountDir)) {
            fs.mkdirSync(fallbackAccountDir, { recursive: true })
          }
          fs.copyFileSync(indexPath, path.resolve(fallbackAccountDir, 'index.html'))
        })
      } catch (error) {
        console.warn('⚠️  Failed to generate dynamic password pages (backend may be offline during build):', error.message)
      }

      // Créer fallback générique pour websites non pré-générés
      const fallbackWebsiteDir = path.resolve(__dirname, 'dist', 'passwords', '_website')
      if (!fs.existsSync(fallbackWebsiteDir)) {
        fs.mkdirSync(fallbackWebsiteDir, { recursive: true })
      }
      fs.copyFileSync(indexPath, path.resolve(fallbackWebsiteDir, 'index.html'))
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
