import { Hono } from 'hono';
import type { RecoinApiEnv } from '@/api/types';
import { route } from '@/api/route-helper';
import { z } from 'zod';

export default new Hono<RecoinApiEnv>().post(
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
