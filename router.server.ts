import waitingList from '@/api/modules/waiting-list/server'
import { Hono } from 'hono'

const app = new Hono()
   .get('/__api', (c) => {
      return c.text(`The recoin server is running on ${navigator.userAgent}!`)
   })
   .route('/__api/waiting-list', waitingList)

export default app
