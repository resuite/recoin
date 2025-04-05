import { defineConfig } from 'vite';
import path from 'node:path';
import { retend } from 'retend/plugin';
import { retendSSG } from 'retend-server/plugin';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './') },
  },
  build: {
    outDir: '../../dist/site',
  },
  server: {
    allowedHosts: ['eyd.adebola.online'],
  },
  plugins: [
    retend(),
    retendSSG({
      pages: ['/'],
      routerModulePath: './router.ts',
    }),
  ],
});
