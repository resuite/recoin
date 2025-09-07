import { and, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { Hono } from 'hono'
import { z } from 'zod'

import * as schema from '@/api/database/schema'
import { Errors, errorOccurred, success } from '@/api/error'
import { route } from '@/api/route-helper'
import type { RecoinApiEnv } from '@/api/types'
import { setAuthCookie, verifyGoogleIdToken } from '@/api/utils'
import { DEFAULT_WORKSPACE_NAME } from '@/constants/shared'

const authRoute = new Hono<RecoinApiEnv>()

authRoute.post(
   '/google/callback',
   ...route({
      body: z.object({ credential: z.string() }),
      controller: async (c) => {
         const { credential } = c.req.valid('json')
         const db = drizzle(c.env.DB, { schema })

         try {
            const payload = await verifyGoogleIdToken(credential, c.env.CF_GOOGLE_CLIENT_ID)
            if (!payload?.sub || !payload.email) {
               return errorOccurred(c, Errors.GOOGLE_AUTH_FAILED)
            }
            const { sub: googleId, email, name } = payload
            const existingUser = await db.query.users.findFirst({
               where: and(eq(schema.users.googleId, googleId), eq(schema.users.email, email))
            })

            if (!existingUser) {
               const userId = crypto.randomUUID()
               const workspaceId = crypto.randomUUID()
               const createdAt = new Date()

               await db.insert(schema.users).values({
                  id: userId,
                  googleId,
                  email,
                  name: name ?? null,
                  createdAt
               })

               await db.insert(schema.workspaces).values({
                  id: workspaceId,
                  name: DEFAULT_WORKSPACE_NAME,
                  userId: userId,
                  createdAt
               })
            }

            setAuthCookie(c)
            return success(c)
         } catch (error) {
            c.status(500)
            if (error instanceof Error) {
               return errorOccurred(c, Errors.UNKNOWN_ERROR_OCCURRED, error)
            }
            return errorOccurred(c, Errors.GOOGLE_AUTH_FAILED)
         }
      }
   })
)

export default authRoute
