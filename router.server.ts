import applicationRoute from '@/api/modules/application/server'
import authenticationRoute from '@/api/modules/authentication/server'
import waitingListRoute from '@/api/modules/waiting-list/server'
import { makeDurableObject } from '@livestore/sync-cf/cf-worker'
import { Hono } from 'hono'

const app = new Hono()
   .get('/__api', (c) => {
      return c.text(`The recoin server is running on ${navigator.userAgent}!`)
   })
   .route('/__api/waiting-list', waitingListRoute)
   .route('/__api/auth', authenticationRoute)
   .route('/__api/app', applicationRoute)

export class LiveStoreSync extends makeDurableObject({}) {}
export default app
