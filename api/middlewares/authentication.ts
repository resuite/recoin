import { Errors, errorOccurred } from '@/api/error'
import type { RecoinApiEnv } from '@/api/types'
import { RECOIN_SESSION_COOKIE } from '@/constants/shared'
import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'

export const sessionAuth = createMiddleware<RecoinApiEnv>(async (c, next) => {
   const sessionToken = getCookie(c, RECOIN_SESSION_COOKIE)
   if (!sessionToken) {
      return errorOccurred(c, Errors.UNAUTHORIZED, 'Unauthorized: No session token provided.')
   }

   const userId = await c.env.RECOIN_SESSIONS.get(sessionToken)
   if (!userId) {
      return errorOccurred(c, Errors.UNAUTHORIZED, 'Unauthorized: Invalid session token.')
   }

   c.set('userId', userId)

   await next()
})
