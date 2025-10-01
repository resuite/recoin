import path from 'node:path'
import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { retendSSG } from 'retend-server/plugin'
import { retend } from 'retend/plugin'
import { defineConfig } from 'vite'
import { patchCssModules } from 'vite-css-modules'
import { VitePWA } from 'vite-plugin-pwa'

const routerModulePath = './router.client.ts'
const pages = ['/', '/app', '/waiting-list', '/styleguide']

export default defineConfig({
   resolve: {
      alias: { '@': path.resolve(__dirname, './') }
   },
   server: {
      allowedHosts: true,
      cors: {
         origin: true
      }
   },
   optimizeDeps: {
      exclude: ['@livestore/adapter-web']
   },
   plugins: [
      tailwindcss(),
      patchCssModules(),
      retend(),
      retendSSG({ pages, routerModulePath }),
      cloudflare(),
      VitePWA({
         scope: '/app',
         registerType: 'autoUpdate',
         devOptions: {
            enabled: false
         }
      })
   ]
})
