import Index from '@/pages'
import styleguideRoutes from '@/pages/styleguide/routes'
import waitingListRoutes from '@/pages/waiting-list/routes'
import { createWebRouter } from 'retend/router'

export const createRouter = () => {
   return createWebRouter({
      stackMode: true,
      routes: [
         {
            name: 'recoin-app-index',
            path: '/',
            component: Index
         },
         ...waitingListRoutes,
         ...styleguideRoutes
      ]
   })
}
