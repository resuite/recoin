import { BASE_URL } from '@/constants'
import { type RouteRecords, lazy } from 'retend/router'

const title = 'recoin'
const description =
   'recoin is your private, simple companion for managing finances.'
const image = `${BASE_URL}/og-image.png`

const metadata = {
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
   twitterImage: image
}

export default (<RouteRecords>[
   {
      name: 'waiting-list',
      path: 'waiting-list',
      component: lazy(() => import('./index')),
      metadata
   },
   {
      name: 'waiting-list-success',
      path: 'waiting-list/success',
      component: lazy(() => import('./success')),
      metadata
   }
])
