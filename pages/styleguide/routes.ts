import { defineRoute } from 'retend/router'

import Styleguide from '@/pages/styleguide'
import BottomSheetTest from '@/pages/styleguide/bottom-sheet'
import ContextMenu from '@/pages/styleguide/context-menu'
import DropdownTest from '@/pages/styleguide/dropdown'
import FloatingActionButtonTest from '@/pages/styleguide/fab'
import KeyboardAvoidanceTest from '@/pages/styleguide/keyboard-avoidance'
import NavStack from '@/pages/styleguide/nav-stack'
import PopoverTest from '@/pages/styleguide/popover'
import PullToRefreshViewTest from '@/pages/styleguide/pull-zone'
import SidebarTest from '@/pages/styleguide/sidebar'
import Tabs from '@/pages/styleguide/tabs'
import Toast from '@/pages/styleguide/toast'

const metadata = {
   title: 'Styleguide',
   description: 'A styleguide for recoin.',
   charset: 'utf-8',
   viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover',
   themeColor: '#272727',
   manifest: '/manifest.json'
}

export default defineRoute({
   name: 'styleguide',
   path: 'styleguide',
   metadata,
   children: [
      {
         path: '',
         component: Styleguide
      },
      {
         path: 'tabs',
         component: Tabs
      },
      {
         path: 'nav-stack',
         component: NavStack
      },
      {
         path: 'toast',
         component: Toast
      },
      {
         path: 'pull-zone',
         component: PullToRefreshViewTest
      },
      {
         path: 'floating-button',
         component: FloatingActionButtonTest
      },
      {
         path: 'sidebar',
         component: SidebarTest
      },
      {
         path: 'keyboard-avoidance',
         component: KeyboardAvoidanceTest
      },
      {
         path: 'sheet',
         component: BottomSheetTest
      },
      {
         path: 'popover',
         component: PopoverTest
      },
      {
         path: 'context-menu',
         component: ContextMenu
      },
      {
         path: 'dropdown',
         component: DropdownTest
      }
   ]
})
