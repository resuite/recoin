import { ToastOutlet } from '@/components/toast';
import { BASE_URL } from '@/constants';
import { sty } from '@/utils';
import type { PageMeta } from 'retend-server/client';
import { useRouter, type RouteComponent } from 'retend/router';

const Site: RouteComponent<PageMeta> = () => {
   const router = useRouter();
   return (
      <>
         <header>{sty('recoin.')}</header>
         <router.Outlet />
         <ToastOutlet />
      </>
   );
};

const title = 'recoin';
const description =
   'recoin is your private, simple companion for managing finances.';
const image = `${BASE_URL}/og-image.png`;

Site.metadata = {
   themeColor: '#272727',
   charset: 'UTF-8',
   viewport: 'width=device-width, initial-scale=1',
   title,
   description,
   lang: 'en',
   ogType: 'website',
   keywords: 'recoin, finance, budget, money, accounting',
   // Open Graph
   ogTitle: title,
   ogDescription: description,
   ogUrl: BASE_URL,
   ogImage: image,
   ogSiteName: title,
   // Twitter
   twitterTitle: title,
   twitterDescription: description,
   twitterImage: image,
};

export default Site;
