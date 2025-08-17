import Index from '@/pages'
import { createWebRouter, lazy } from 'retend/router'

const metadata = {
   viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover',
   themeColor: '#272727',
   manifest: '/manifest.json'
}

export const createRouter = () => {
   return createWebRouter({
      stackMode: true,
      routes: [
         {
            path: '/',
            component: Index,
            redirect: '/waiting-list',
            metadata,
            children: [
               {
                  path: 'styleguide',
                  subtree: lazy(() => import('@/pages/styleguide/routes'))
               },
               {
                  path: 'waiting-list',
                  subtree: lazy(() => import('@/pages/waiting-list/routes'))
               },
               {
                  path: 'app',
                  subtree: lazy(() => import('@/pages/app/routes'))
               }
            ]
         }
      ]
   })
}
