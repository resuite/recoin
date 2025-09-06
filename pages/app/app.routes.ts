import App from '@/pages/app'
import { defineRoute } from 'retend/router'
import Home from './home'

export default defineRoute({
   name: 'application',
   path: '/app',
   component: App,
   children: [
      {
         path: '',
         component: Home
      }
   ]
})
