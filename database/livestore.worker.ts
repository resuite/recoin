import { makeWorker } from '@livestore/adapter-web/worker'
import { makeCfSync } from '@livestore/sync-cf'
import { schema } from '@/database/schema'

makeWorker({
   schema,
   sync: { backend: makeCfSync({ url: `${self.location.origin}/__api/auth/livestore` }) }
})
