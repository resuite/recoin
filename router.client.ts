import { createWebRouter } from 'retend/router';
import waitingListRoutes from '@/pages/waiting-list/routes';
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
         ...waitingListRoutes,
         ...styleguideRoutes,
      ],
   });
};
