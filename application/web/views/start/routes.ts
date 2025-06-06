import { defineRoute } from 'retend/router';
import Start from '.';

export const startRoute = defineRoute({
   name: 'Start View',
   path: '/',
   component: Start,
});
