import { Hono } from 'hono';
import waitingList from '@recoin/api/waiting-list/server';
import type { RecoinApiEnv } from '@recoin/api/types';

const app = new Hono<RecoinApiEnv>();

app.get('/', (c) => {
   return c.text('The recoin server is running!');
});
app.route('/waiting-list', waitingList);

export default app;
