import App from '@/pages/app'
import { defineRoute } from 'retend/router'
import StartScreen from './start-screen'

export default defineRoute({
   name: 'application',
   path: '/app',
   component: App,
   children: [
      {
         path: '',
         component: StartScreen
      }
   ]
})
