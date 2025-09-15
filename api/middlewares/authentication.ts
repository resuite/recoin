import { Errors, errorOccurred } from '@/api/error'
import type { RecoinApiEnv } from '@/api/types'
import { RECOIN_SESSION_COOKIE, StatusCodes } from '@/constants/server'
import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'

export const sessionAuth = createMiddleware<RecoinApiEnv>(async (c, next) => {
   const sessionToken = getCookie(c, RECOIN_SESSION_COOKIE)
   if (!sessionToken) {
      c.status(StatusCodes.Unauthorized)
      return errorOccurred(c, Errors.UnAuthorized, 'Unauthorized: No session token provided.')
   }

   const userId = await c.env.RECOIN_SESSIONS.get(sessionToken)
   if (!userId) {
      c.status(StatusCodes.Unauthorized)
      return errorOccurred(c, Errors.UnAuthorized, 'Unauthorized: Invalid session token.')
   }

   c.set('userId', userId)

   await next()
})
