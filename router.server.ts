import waitingList from '@/api/modules/waiting-list/server'
import { Hono } from 'hono'

const app = new Hono()
   .get('/api', (c) => {
      return c.text(`The recoin server is running on ${navigator.userAgent}!`)
   })
   .route('/api/waiting-list', waitingList)

export default app
