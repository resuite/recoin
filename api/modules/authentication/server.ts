import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { OAuth2Client } from 'google-auth-library'
import { type Context, Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import { z } from 'zod'

import * as schema from '@/api/database/schema'
import { Errors, errorOccurred, success } from '@/api/error'
import { route } from '@/api/route-helper'
import type { RecoinApiEnv } from '@/api/types'
import { DEFAULT_WORKSPACE_NAME, RECOIN_SESSION_COOKIE } from '@/constants/shared'

const authRoute = new Hono<RecoinApiEnv>()

authRoute.post(
   '/google/callback',
   ...route({
      body: z.object({ credential: z.string() }),
      controller: async (c) => {
         const { credential } = c.req.valid('json')
         const GOOGLE_CLIENT_ID = c.env.GOOGLE_CLIENT_ID
         const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)
         const db = drizzle(c.env.DB, { schema })

         try {
            const ticket = await googleClient.verifyIdToken({
               idToken: credential,
               audience: GOOGLE_CLIENT_ID
            })

            const payload = ticket.getPayload()
            if (!payload?.sub || !payload.email) {
               return errorOccurred(c, Errors.GOOGLE_AUTH_FAILED)
            }

            const { sub: googleId, email, name } = payload

            const existingUser = await db.query.users.findFirst({
               where: eq(schema.users.googleId, googleId)
            })

            if (!existingUser) {
               await db.transaction(async (tx) => {
                  const userId = crypto.randomUUID()
                  const workspaceId = crypto.randomUUID()
                  const createdAt = new Date()

                  await tx.insert(schema.users).values({
                     id: userId,
                     googleId,
                     email,
                     name: name ?? null,
                     createdAt
                  })

                  await tx.insert(schema.workspaces).values({
                     id: workspaceId,
                     name: DEFAULT_WORKSPACE_NAME,
                     userId: userId,
                     createdAt
                  })
               })
            }

            const sessionToken = crypto.randomUUID()
            setCookie(c as unknown as Context, RECOIN_SESSION_COOKIE, sessionToken, {
               path: '/',
               secure: true,
               httpOnly: true,
               sameSite: 'Lax',
               maxAge: 60 * 60 * 24 * 30
            })

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
