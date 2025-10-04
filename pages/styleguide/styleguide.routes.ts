import { defineRoute, lazy } from 'retend/router'

const metadata = {
   title: 'Styleguide',
   description: 'A styleguide for recoin.',
   charset: 'utf-8'
}

export default defineRoute({
   name: 'styleguide',
   path: 'styleguide',
   metadata,
   children: [
      {
         path: '',
         component: lazy(() => import('@/pages/styleguide'))
      },
      {
         path: 'tabs',
         component: lazy(() => import('@/pages/styleguide/tabs'))
      },
      {
         path: 'nav-stack',
         component: lazy(() => import('@/pages/styleguide/nav-stack'))
      },
      {
         path: 'toast',
         component: lazy(() => import('@/pages/styleguide/toast'))
      },
      {
         path: 'pull-zone',
         component: lazy(() => import('@/pages/styleguide/pull-zone'))
      },
      {
         path: 'floating-button',
         component: lazy(() => import('@/pages/styleguide/fab'))
      },
      {
         path: 'sidebar',
         component: lazy(() => import('@/pages/styleguide/sidebar'))
      },
      {
         path: 'keyboard-avoidance',
         component: lazy(() => import('@/pages/styleguide/keyboard-avoidance'))
      },
      {
         path: 'sheet',
         component: lazy(() => import('@/pages/styleguide/bottom-sheet'))
      },
      {
         path: 'popover',
         component: lazy(() => import('@/pages/styleguide/popover'))
      },
      {
         path: 'context-menu',
         component: lazy(() => import('@/pages/styleguide/context-menu'))
      },
      {
         path: 'dropdown',
         component: lazy(() => import('@/pages/styleguide/dropdown'))
      },
      {
         path: 'keypad',
         component: lazy(() => import('@/pages/styleguide/keypad'))
      },
      {
         path: 'coin',
         component: lazy(() => import('@/pages/styleguide/coin'))
      }
   ]
})
