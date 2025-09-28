import * as schema from '@/api/database/schema'
import type { UserData } from '@/api/database/types'
import { Errors, errorOccurred, success } from '@/api/error'
import { route } from '@/api/route-helper'
import type { RecoinApiEnv } from '@/api/types'
import { StatusCodes } from '@/constants/server'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { Hono } from 'hono'
import { z } from 'zod'

const applicationRoute = new Hono<RecoinApiEnv>()

applicationRoute.get(
   '/me',
   ...route({
      isProtected: true,
      controller: async (c) => {
         const db = drizzle(c.env.DB, { schema })
         const userId = c.get('userId')
         const user = await db.query.users.findFirst({
            where: eq(schema.users.id, userId),
            with: { workspaces: { limit: 1 } }
         })

         if (!user) {
            // This could happen if a user is deleted but their session is still active.
            c.status(StatusCodes.Unauthorized)
            return errorOccurred(c, Errors.UnAuthorized, 'User not found')
         }
         const { googleId: _, createdAt: __, ...safeUserData } = user
         c.status(StatusCodes.Ok)
         return success(c, safeUserData satisfies UserData)
      }
   })
)

applicationRoute.post(
   '/onboarding',
   ...route({
      isProtected: true,
      body: z.object({
         currency: z.string().min(3),
         startingBalance: z.number().int()
      }),
      controller: async (c) => {
         const db = drizzle(c.env.DB, { schema })
         const userId = c.get('userId')
         const { currency, startingBalance } = c.req.valid('json')

         const user = await db.query.users.findFirst({
            where: eq(schema.users.id, userId),
            with: { workspaces: { limit: 1 } }
         })
         const workspace = user?.workspaces?.at(0)

         if (!user) {
            c.status(StatusCodes.InternalServerError)
            return errorOccurred(c, Errors.UnAuthorized, 'User not found.')
         }

         if (!workspace) {
            c.status(StatusCodes.InternalServerError)
            return errorOccurred(c, Errors.UnAuthorized, 'User workspace not found.')
         }

         const [updatedWorkspace] = await db
            .update(schema.workspaces)
            .set({ currency, startingBalance })
            .where(eq(schema.workspaces.id, workspace.id))
            .returning()

         c.status(StatusCodes.Ok)
         const { googleId: _, createdAt: __, ...userData } = user
         return success(c, { ...userData, workspaces: [updatedWorkspace] } satisfies UserData)
      }
   })
)

export default applicationRoute
