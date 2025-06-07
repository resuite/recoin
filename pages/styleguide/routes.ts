import type { RouteRecords } from 'retend/router';
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

export default (<RouteRecords>[
   {
      name: 'styleguide',
      path: '/styleguide',
      component: Styleguide,
      metadata,
   },
   {
      name: 'styleguide-tabs',
      path: '/styleguide/tabs',
      component: Tabs,
      metadata,
   },
   {
      name: 'styleguide-nav-stack',
      path: '/styleguide/nav-stack',
      component: NavStack,
      metadata,
   },
   {
      name: 'styleguide-toast',
      path: '/styleguide/toast',
      component: Toast,
      metadata,
   },
   {
      name: 'styleguide-pull-zone',
      path: '/styleguide/pull-zone',
      component: PullToRefreshTest,
      metadata,
   },
   {
      name: 'styleguide-floating-button',
      path: '/styleguide/floating-button',
      component: FloatingActionButtonTest,
      metadata,
   },
   {
      name: 'styleguide-sidebar',
      path: '/styleguide/sidebar',
      component: SidebarTest,
      metadata,
   },
]);
