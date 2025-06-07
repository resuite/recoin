import path from 'node:path';
import { defineConfig } from 'vite';
import { retend } from 'retend/plugin';
import { retendSSG } from 'retend-server/plugin';
import tailwindcss from '@tailwindcss/vite';
import { cloudflare } from '@cloudflare/vite-plugin';

const routerModulePath = './source/router.client.ts';
const pages = ['/', '/nav-stack', '/tabs', '/pull-zone', '/toast', '/sidebar'];

export default defineConfig({
   resolve: {
      alias: { '@': path.resolve(__dirname, './') },
   },
   server: {
      allowedHosts: true,
      cors: {
         origin: true,
      },
   },
   plugins: [
      tailwindcss(),
      retend(),
      retendSSG({ pages, routerModulePath }),
      cloudflare(),
   ],
});
