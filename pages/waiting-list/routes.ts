import { BASE_URL } from '@/constants'
import { defineRoute } from 'retend/router'

import WaitingList from '@/pages/waiting-list'
import WaitingListHome from '@/pages/waiting-list/home'
import WaitingListSuccess from '@/pages/waiting-list/success'

const title = 'recoin'
const description = 'recoin is your private, simple companion for managing finances.'
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

export default defineRoute({
   name: 'waiting-list',
   path: 'waiting-list',
   component: WaitingList,
   metadata,
   children: [
      {
         path: '',
         component: WaitingListHome
      },
      {
         path: 'success',
         component: WaitingListSuccess
      }
   ]
})
