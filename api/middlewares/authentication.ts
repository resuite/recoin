import { Errors, errorOccurred } from '@/api/error'
import type { RecoinApiEnv } from '@/api/types'
import { refreshAuthCookie } from '@/api/utils'
import { RECOIN_SESSION_COOKIE, SESSION_EXPIRATION_SECONDS, StatusCodes } from '@/constants/server'
import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'

export const sessionAuth = createMiddleware<RecoinApiEnv>(async (c, next) => {
   const sessionToken = getCookie(c, RECOIN_SESSION_COOKIE)
   if (!sessionToken) {
      c.status(StatusCodes.Unauthorized)
      return errorOccurred(c, Errors.UnAuthorized, 'Unauthorized: No session token provided.')
   }

   const sessionData = await c.env.RECOIN_SESSIONS.get(sessionToken)
   if (!sessionData) {
      c.status(StatusCodes.Unauthorized)
      return errorOccurred(c, Errors.UnAuthorized, 'Unauthorized: Invalid session token.')
   }

   let parsedSessionData: { userId: string; createdAt: number }
   try {
      parsedSessionData = JSON.parse(sessionData as string) as { userId: string; createdAt: number }
   } catch {
      c.status(StatusCodes.Unauthorized)
      return errorOccurred(c, Errors.UnAuthorized, 'Unauthorized: Corrupted session data.')
   }

   const { userId, createdAt } = parsedSessionData
   const now = Date.now()
   const sessionAge = now - createdAt
   const refreshThreshold = SESSION_EXPIRATION_SECONDS * 1000 * 0.8

   if (sessionAge > refreshThreshold) {
      await refreshAuthCookie(c, sessionToken, userId)
   }

   c.set('userId', userId)

   await next()
})
