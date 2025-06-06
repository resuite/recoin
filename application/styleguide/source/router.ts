import { createWebRouter } from 'retend/router';
import Styleguide from '.';
import Tabs from './tabs';
import NavStack from './nav-stack';
import Toast from './toast';
import PullToRefreshTest from './pull-zone';
import FloatingActionButtonTest from './fab';
import SidebarTest from './sidebar';

const metadata = {
   title: 'Styleguide',
   description: 'A styleguide for recoin.',
   charset: 'utf-8',
   viewport:
      'width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover',
   themeColor: '#272727',
   manifest: '/manifest.json',
};

export function createRouter() {
   return createWebRouter({
      routes: [
         {
            name: 'styleguide',
            path: '/',
            component: Styleguide,
            metadata,
         },
         {
            name: 'styleguide-tabs',
            path: '/tabs',
            component: Tabs,
            metadata,
         },
         {
            name: 'styleguide-nav-stack',
            path: '/nav-stack',
            component: NavStack,
            metadata,
         },
         {
            name: 'styleguide-toast',
            path: '/toast',
            component: Toast,
            metadata,
         },
         {
            name: 'styleguide-pull-zone',
            path: '/pull-zone',
            component: PullToRefreshTest,
            metadata,
         },
         {
            name: 'styleguide-floating-button',
            path: '/floating-button',
            component: FloatingActionButtonTest,
            metadata,
         },
         {
            name: 'styleguide-sidebar',
            path: '/sidebar',
            component: SidebarTest,
            metadata,
         },
      ],
   });
}
