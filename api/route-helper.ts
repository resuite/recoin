import { sessionAuth } from '@/api/middlewares/authentication'
import type { RecoinApiEnv } from '@/api/types'
import { zValidator } from '@hono/zod-validator'
import type { MiddlewareHandler, Context as RawContext, Env as RawEnv } from 'hono'
import type { z } from 'zod'

export type CustomContext<Env, _ParamSchema, BodySchema, IsProtected> = Env extends RawEnv
   ? RawContext<Env> extends infer C
      ? C extends RawContext<Env>
         ? Omit<C, 'req' | 'get'> & {
              req: C['req'] & {
                 valid: C['req']['valid'] &
                    ((
                       type: 'json'
                    ) => BodySchema extends z.ZodObject<z.ZodRawShape>
                       ? z.infer<BodySchema>
                       : never)
              }
              get: C['get'] &
                 (IsProtected extends true
                    ? (key: 'userId') => string
                    : (key: 'userId') => undefined)
           }
         : never
      : never
   : never

export type RouteHandlers<Env, Params, Body, IsProtected> = Array<
   MiddlewareHandler | RouteController<Env, Params, Body, IsProtected>
>

export type RouteController<Env, Params, Body, IsProtected> = (
   c: CustomContext<Env, Params, Body, IsProtected>
) => Promise<Response> | Response

export type RouteConfig<Params, Body, IsProtected> = {
   param?: Params
   body?: Body
   isProtected?: IsProtected
   controller: RouteController<RecoinApiEnv, Params, Body, IsProtected>
   middleware?: Array<MiddlewareHandler>
}

export function route<
   Params extends z.ZodObject<z.ZodRawShape>,
   Body extends z.ZodObject<z.ZodRawShape>,
   IsProtected extends boolean = false
>(config: RouteConfig<Params, Body, IsProtected>) {
   const handlers: RouteHandlers<RecoinApiEnv, Params, Body, IsProtected> = []

   if (config.isProtected) {
      handlers.push(sessionAuth)
   }

   if (config.middleware) {
      handlers.push(...config.middleware)
   }

   if (config.param) {
      handlers.push(zValidator('param', config.param))
   }

   if (config.body) {
      handlers.push(zValidator('json', config.body))
   }

   handlers.push(config.controller)

   return handlers as [...Array<MiddlewareHandler>]
}
