import Index from '@/pages'
import { createWebRouter, lazy } from 'retend/router'

export const createRouter = () => {
   return createWebRouter({
      stackMode: true,
      routes: [
         {
            path: '/',
            component: Index,
            redirect: '/waiting-list',
            children: [
               {
                  path: 'styleguide',
                  subtree: lazy(() => import('@/pages/styleguide/routes'))
               },
               {
                  path: 'waiting-list',
                  subtree: lazy(() => import('@/pages/waiting-list/routes'))
               }
            ]
         }
      ]
   })
}
