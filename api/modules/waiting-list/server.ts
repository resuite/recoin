import { Errors, errorOccurred, success } from '@/api/error'
import { route } from '@/api/route-helper'
import type { RecoinApiEnv } from '@/api/types'
import { StatusCodes } from '@/constants/server'
import { Hono } from 'hono'
import { z } from 'zod'

const waitingListRoute = new Hono<RecoinApiEnv>()

waitingListRoute.post(
   '/',
   ...route({
      body: z.object({
         email: z.string().email()
      }),

      controller: async (c) => {
         const { email } = c.req.valid('json')
         const waitingList = c.env.RECOIN_WAITING_LIST

         if (await waitingList.get(email)) {
            c.status(StatusCodes.Conflict)
            return errorOccurred(c, Errors.EmailAlreadyExists)
         }

         try {
            await waitingList.put(email, new Date().toISOString())
         } catch (error) {
            c.status(StatusCodes.InternalServerError)
            if (error instanceof Error) {
               return errorOccurred(c, Errors.UnknownErrorOccured, error)
            }
            return errorOccurred(c, Errors.UnknownErrorOccured)
         }

         return success(c)
      }
   })
)

export default waitingListRoute
