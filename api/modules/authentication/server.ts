import * as schema from '@/api/database/schema'
import type { UserData } from '@/api/database/types'
import { Errors, RecoinError, errorOccurred, success } from '@/api/error'
import { route } from '@/api/route-helper'
import type { RecoinApiEnv } from '@/api/types'
import { clearAuthCookie, setAuthCookie, verifyGoogleIdToken } from '@/api/utils'
import { DEFAULT_WORKSPACE, LIVESTORE_SYNC_DO_NAME, StatusCodes } from '@/constants/server'
import type { ExecutionContext } from '@cloudflare/workers-types'
import { handleWebSocket } from '@livestore/sync-cf/cf-worker'
import { and, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { Hono } from 'hono'
import { z } from 'zod'

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
               family_name: lastName,
               picture: avatarUrl
            } = payload
            let user = await db.query.users.findFirst({
               where: and(eq(schema.users.googleId, googleId), eq(schema.users.email, email)),
               with: { workspaces: { limit: 1 } }
            })

            const userId = user?.id ?? crypto.randomUUID()
            if (!user) {
               const workspaceId = crypto.randomUUID()
               const createdAt = new Date()
               // todo: wrap in transaction when drizzle supports it for D1.
               const [[newUser], [newWorkspace]] = await Promise.all([
                  db
                     .insert(schema.users)
                     .values({
                        id: userId,
                        googleId,
                        email,
                        fullName,
                        firstName,
                        lastName,
                        avatarUrl,
                        createdAt
                     })
                     .returning(),
                  db
                     .insert(schema.workspaces)
                     .values({ id: workspaceId, name: DEFAULT_WORKSPACE, userId, createdAt })
                     .returning()
               ])
               user = { ...newUser, workspaces: [newWorkspace] }
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

authenticationRoute.get(
   '/livestore/websocket',
   ...route({
      isProtected: true,
      controller: (context) => {
         const userId = context.get('userId')
         const { raw: request } = context.req
         const { env, executionCtx } = context

         return handleWebSocket(request, env, executionCtx as ExecutionContext, {
            durableObject: {
               name: LIVESTORE_SYNC_DO_NAME
            },
            validatePayload: (payload) => {
               const { authToken } = payload as unknown as { authToken: string }
               if (authToken !== userId) {
                  throw new RecoinError(Errors.UnAuthorized)
               }
            }
         })
      }
   })
)

export default authenticationRoute
