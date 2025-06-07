import { Hono } from 'hono';
import type { RecoinApiEnv } from '#types';
import { route } from '#route';
import { z } from 'zod';

const app = new Hono<RecoinApiEnv>();

app.post(
   '/',
   ...route({
      body: z.object({
         email: z.string().email(),
      }),
      controller: (c) => {
         const { email } = c.req.valid('json');
         console.log('Email:', email);

         return c.json({ success: true });
      },
   }),
);

export default app;
