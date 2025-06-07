import { createWebRouter } from 'retend/router';
import styleguideRoutes from '@/pages/styleguide/routes';
import Index from '@/pages';

export const createRouter = () => {
   return createWebRouter({
      routes: [
         {
            name: 'recoin-app-index',
            path: '/',
            component: Index,
         },
         ...styleguideRoutes,
      ],
   });
};
