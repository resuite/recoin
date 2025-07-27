import Index from '@/pages'
import { createWebRouter, lazy } from 'retend/router'

export const createRouter = () => {
   return createWebRouter({
      stackMode: true,
      routes: [
         {
            path: '/',
            component: Index,
            redirect: '/styleguide',
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
