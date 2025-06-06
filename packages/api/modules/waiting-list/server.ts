import { Hono } from 'hono';
import type { RecoinApiEnv } from '../../helpers/types.ts';
import { route } from '../../helpers/route.js';
import { z } from 'zod';

const app = new Hono<RecoinApiEnv>();

app.post(
   '/',
   ...route({
      body: z.object({
         email: z.string().email(),
      }),
      controller: async (c) => {
         const { email } = await c.req.valid('json');
         console.log(email);

         return c.json({ success: true });
      },
   }),
);

export default app;
