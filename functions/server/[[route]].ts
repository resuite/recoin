import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import waitingList from '@recoin/api/waiting-list/server';

const app = new Hono();

app.get('/', (c) => {
   return c.text('The recoin server is running!');
});
app.route('/waiting-list', waitingList);

export const onRequest = handle(app);
