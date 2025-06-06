import { Hono } from 'hono';
import waitingList from './modules/waiting-list/server.ts';
import type { RecoinApiEnv } from './helpers/types.ts';

const app = new Hono<RecoinApiEnv>();

app.get('/', (c) => {
   return c.text('The recoin server is running!');
});
app.route('/waiting-list', waitingList);

export default app;
