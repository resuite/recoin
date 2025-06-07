import { Hono } from 'hono';
import waitingList from '@/api/modules/waiting-list/server';

const app = new Hono()
   .get('/', (c) => {
      return c.text(`The recoin server is running on ${navigator.userAgent}!`);
   })
   .route('/waiting-list', waitingList);

export default new Hono().route('/api', app);
