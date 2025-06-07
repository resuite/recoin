import { hydrate } from 'retend-server/client';
import { createRouter } from './router.client';

hydrate(createRouter).then(() => {
   console.log('[retend-server] app successfully hydrated.');
});
