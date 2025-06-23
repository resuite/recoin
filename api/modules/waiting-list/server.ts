import { Errors, errorOccurred, success } from '@/api/error'
import { route } from '@/api/route-helper'
import type { RecoinApiEnv } from '@/api/types'
import { Hono } from 'hono'
import { z } from 'zod'

export default new Hono<RecoinApiEnv>().post(
   '/',
   ...route({
      body: z.object({
         email: z.string().email()
      }),
      controller: async (c) => {
         const { email } = c.req.valid('json')
         const waitingList = c.env.RECOIN_WAITING_LIST

         if (await waitingList.get(email)) {
            c.status(409)
            return errorOccurred(c, Errors.EMAIL_ALREADY_EXISTS)
         }

         try {
            await waitingList.put(email, new Date().toISOString())
         } catch (error) {
            c.status(500)
            if (error instanceof Error) {
               return errorOccurred(c, Errors.UNKNOWN_ERROR_OCCURRED, error)
            }
            return errorOccurred(c, Errors.UNKNOWN_ERROR_OCCURRED)
         }

         return success(c)
      }
   })
)
