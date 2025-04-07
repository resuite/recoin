import { ToastOutlet } from '@/components/toast';
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

Site.metadata = {
  themeColor: '#272727',
  charset: 'UTF-8',
  viewport: 'width=device-width, initial-scale=1',
  title: 'recoin',
  description:
    'recoin is your private, simple companion for managing finances.',
};

export default Site;
