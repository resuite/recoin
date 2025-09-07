import * as schema from '@/api/database/schema'
import type { UserData } from '@/api/database/types'
import { Errors, errorOccurred, success } from '@/api/error'
import { route } from '@/api/route-helper'
import type { RecoinApiEnv } from '@/api/types'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { Hono } from 'hono'

const applicationRoute = new Hono<RecoinApiEnv>()

applicationRoute.get(
   '/me',
   ...route({
      isProtected: true,
      controller: async (c) => {
         const db = drizzle(c.env.DB, { schema })
         const userId = c.get('userId')
         const user = await db.query.users.findFirst({
            where: eq(schema.users.id, userId)
         })

         if (!user) {
            // This could happen if a user is deleted but their session is still active.
            return errorOccurred(c, Errors.UNAUTHORIZED, 'User not found')
         }

         const { googleId, createdAt, ...safeUserData } = user
         c.status(200)
         return success(c, safeUserData satisfies UserData)
      }
   })
)

export default applicationRoute
