import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';

const app = new Hono();

app.get('/', (c) => {
   return c.text('The recoin server is running!');
});

export const onRequest = handle(app);
