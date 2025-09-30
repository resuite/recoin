import App from '@/pages/app'
import { defineRoute } from 'retend/router'
import Budgets from './budgets'
import Categories from './categories'
import Chat from './chat'
import Feedback from './feedback'
import Home from './home'
import Profile from './profile'
import Reports from './reports'
import Settings from './settings'

export default defineRoute({
   name: 'application',
   path: '/app',
   component: App,
   children: [
      {
         path: '',
         component: Home
      },
      {
         path: 'chat',
         component: Chat
      },
      {
         path: 'reports',
         component: Reports
      },
      {
         path: 'budgets',
         component: Budgets
      },
      {
         path: 'categories',
         component: Categories
      },
      {
         path: 'profile',
         component: Profile
      },
      {
         path: 'feedback',
         component: Feedback
      },
      {
         path: 'settings',
         component: Settings
      }
   ]
})
