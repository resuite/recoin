import { createWebRouter } from 'retend/router';
import ComingSoon from './pages/coming-soon';
import Site from './pages';
import ComingSoonWaitlistSuccess from './pages/coming-soon-waitlist-success';

export function createRouter() {
  return createWebRouter({
    routes: [
      {
        name: 'Home Page',
        path: '/',
        component: Site,
        redirect: '/coming-soon',
        children: [
          {
            name: 'Coming Soon',
            path: '/coming-soon',
            component: ComingSoon,
          },
          {
            name: 'Coming Soon - Added to Waitlist',
            path: '/coming-soon-waitlist-success',
            component: ComingSoonWaitlistSuccess,
          },
        ],
      },
    ],
  });
}
