import LiveStoreWorker from '@/data/livestore/livestore.worker?worker'
import { RECOIN_BASE_SCHEMA } from '@/data/livestore/schema'
import { makePersistedAdapter } from '@livestore/adapter-web'
import LiveStoreSharedWorker from '@livestore/adapter-web/shared-worker?sharedworker'
import type { Store } from '@livestore/livestore'
import { createStorePromise } from '@livestore/livestore'

export type RecoinStore = Store<typeof RECOIN_BASE_SCHEMA>

export function createRecoinStore(): Promise<RecoinStore> {
   return createStorePromise({
      storeId: 'recoin',
      adapter: makePersistedAdapter({
         storage: { type: 'opfs' },
         worker: LiveStoreWorker,
         sharedWorker: LiveStoreSharedWorker
      }),
      schema: RECOIN_BASE_SCHEMA
   })
}
