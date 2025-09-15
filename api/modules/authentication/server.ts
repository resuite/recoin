import { and, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { Hono } from 'hono'
import { z } from 'zod'

import * as schema from '@/api/database/schema'
import type { UserData } from '@/api/database/types'
import { Errors, errorOccurred, success } from '@/api/error'
import { route } from '@/api/route-helper'
import type { RecoinApiEnv } from '@/api/types'
import { clearAuthCookie, setAuthCookie, verifyGoogleIdToken } from '@/api/utils'
import { DEFAULT_WORKSPACE, StatusCodes } from '@/constants/server'

const authenticationRoute = new Hono<RecoinApiEnv>()

authenticationRoute.post(
   '/google/callback',
   ...route({
      body: z.object({ credential: z.string() }),
      controller: async (context) => {
         const { credential } = context.req.valid('json')
         const db = drizzle(context.env.DB, { schema })

         try {
            const payload = await verifyGoogleIdToken(credential, context.env.CF_GOOGLE_CLIENT_ID)
            if (!payload?.sub || !payload.email) {
               return errorOccurred(context, Errors.GoogleAuthFailed)
            }

            const {
               sub: googleId,
               email,
               name: fullName = null,
               given_name: firstName,
               family_name: lastName
            } = payload
            let user = await db.query.users.findFirst({
               where: and(eq(schema.users.googleId, googleId), eq(schema.users.email, email))
            })

            const userId = user?.id ?? crypto.randomUUID()
            if (!user) {
               const workspaceId = crypto.randomUUID()
               const createdAt = new Date()
               // todo: wrap in transaction when drizzle supports it for D1.
               const [[newUser]] = await Promise.all([
                  db
                     .insert(schema.users)
                     .values({
                        id: userId,
                        googleId,
                        email,
                        fullName,
                        firstName,
                        lastName,
                        createdAt
                     })
                     .returning(),
                  db
                     .insert(schema.workspaces)
                     .values({ id: workspaceId, name: DEFAULT_WORKSPACE, userId, createdAt })
               ])
               user = newUser
            }
            await setAuthCookie(context, userId)
            const { googleId: _, createdAt: __, ...userData } = user

            context.status(StatusCodes.Created)
            return success(context, userData satisfies UserData)
         } catch (error) {
            context.status(StatusCodes.InternalServerError)
            if (error instanceof Error) {
               return errorOccurred(context, Errors.UnknownErrorOccured, error)
            }
            return errorOccurred(context, Errors.GoogleAuthFailed)
         }
      }
   })
)

authenticationRoute.post(
   '/logout',
   ...route({
      controller: async (context) => {
         await clearAuthCookie(context)
         return context.json({ success: true })
      }
   })
)

export default authenticationRoute
