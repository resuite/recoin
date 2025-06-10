import { hydrate } from 'retend-server/client';
import { createRouter } from './router.client';

hydrate(createRouter).then(() => {
   // biome-ignore lint/suspicious/noConsole: needed to check retend-server hydration success.
   console.log('[retend-server] app successfully hydrated.');
});
