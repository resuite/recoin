// biome-ignore-all lint/suspicious/noConsole: sorta the point.
import { Hono } from 'hono'
import { z } from 'zod'
import type { RecoinApiEnv } from '@/api/types'

const debugRoute = new Hono<RecoinApiEnv>()

const consoleLogSchema = z.object({
   deviceId: z.string(),
   level: z.enum(['log', 'warn', 'error', 'info', 'debug']),
   args: z.array(z.string()),
   timestamp: z.string()
})

const levelColors = {
   log: '\x1b[37m', // white
   info: '\x1b[36m', // cyan
   debug: '\x1b[35m', // magenta
   warn: '\x1b[33m', // yellow
   error: '\x1b[31m' // red
}
const reset = '\x1b[0m'
const dim = '\x1b[2m'
const bold = '\x1b[1m'

debugRoute.post('/console', async (c) => {
   try {
      const body = await c.req.json()
      const result = consoleLogSchema.safeParse(body)

      if (!result.success) {
         return c.json({ error: 'Invalid request' }, 400)
      }

      const { deviceId, level, args, timestamp } = result.data
      const color = levelColors[level]
      const time = new Date(timestamp).toLocaleTimeString('en-US', {
         hour: '2-digit',
         minute: '2-digit',
         second: '2-digit',
         hour12: false
      })

      // Format the log message for the terminal
      const prefix = `${dim}[${time}]${reset} ${bold}[${deviceId}]${reset} ${color}[${level.toUpperCase()}]${reset}`
      const message = args.join(' ')

      // Log to server console
      console.log(`${prefix} ${message}`)

      return c.json({ success: true })
   } catch (error) {
      console.error('Error processing debug log:', error)
      return c.json({ error: 'Internal error' }, 500)
   }
})

export default debugRoute
