import { Hono } from 'hono';
import waitingList from '#modules/waiting-list/server';

export default new Hono()
   .get('/', (c) => {
      return c.text(`The recoin server is running on ${navigator.userAgent}!`);
   })
   .route('/waiting-list', waitingList);
