import path from 'node:path'
import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { retendSSG } from 'retend-server/plugin'
import { retend } from 'retend/plugin'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const routerModulePath = './router.client.ts'
const pages = [
   '/',
   '/waiting-list',
   '/styleguide',
   '/styleguide/nav-stack',
   '/styleguide/tabs',
   '/styleguide/pull-zone',
   '/styleguide/toast',
   '/styleguide/sidebar',
   '/styleguide/context-menu',
   '/styleguide/popover'
]

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
   plugins: [
      tailwindcss(),
      retend(),
      retendSSG({ pages, routerModulePath }),
      cloudflare(),
      VitePWA({
         registerType: 'autoUpdate',
         devOptions: {
            enabled: false
         }
      })
   ]
})
