import type { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type {
   Context as RawContext,
   MiddlewareHandler,
   Env as RawEnv,
} from 'hono';
import type { RecoinApiEnv } from './types.ts';

export type CustomContext<Env, ParamSchema, BodySchema> = Env extends RawEnv
   ? RawContext<Env> extends infer C
      ? C extends RawContext<Env>
         ? Omit<C, 'req'> & {
              req: Omit<C['req'], 'json' | 'param'> & {
                 param: ParamSchema extends z.ZodObject<z.ZodRawShape>
                    ? () => z.infer<ParamSchema>
                    : C['req']['param'];
                 json: BodySchema extends z.ZodObject<z.ZodRawShape>
                    ? () => Promise<z.infer<BodySchema>>
                    : C['req']['json'];
              };
           }
         : never
      : never
   : never;

export type RouteHandlers<Env, Params, Body> = Array<
   MiddlewareHandler | RouteController<Env, Params, Body>
>;

export type RouteController<Env, Params, Body> = (
   c: CustomContext<Env, Params, Body>,
) => Response | Promise<Response>;

export type RouteConfig<Params, Body> = {
   paramSchema?: Params;
   body?: Body;
   controller: RouteController<RecoinApiEnv, Params, Body>;
   middleware?: MiddlewareHandler[];
};

export function route<
   Params extends z.ZodObject<z.ZodRawShape>,
   Body extends z.ZodObject<z.ZodRawShape>,
>(config: RouteConfig<Params, Body>) {
   const handlers: RouteHandlers<RecoinApiEnv, Params, Body> = [
      ...(config.middleware || []),
   ];

   if (config.paramSchema) {
      handlers.push(zValidator('param', config.paramSchema));
   }

   if (config.body) {
      handlers.push(zValidator('json', config.body));
   }

   handlers.push(config.controller);

   return handlers as [
      ...MiddlewareHandler[],
      RouteController<RecoinApiEnv, Params, Body>,
   ];
}
