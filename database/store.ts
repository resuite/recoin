import LiveStoreWorker from '@/database/livestore.worker?worker'
import { schema } from '@/database/schema'
import { makePersistedAdapter } from '@livestore/adapter-web'
import LiveStoreSharedWorker from '@livestore/adapter-web/shared-worker?sharedworker'
import type { Store } from '@livestore/livestore'
import { createStorePromise } from '@livestore/livestore'

export type RecoinStore = Store<typeof schema>

export function createRecoinStore(userId: string): Promise<RecoinStore> {
   return createStorePromise({
      storeId: `userStore_${userId}`,
      syncPayload: { authToken: userId },
      adapter: makePersistedAdapter({
         storage: { type: 'opfs' },
         worker: LiveStoreWorker,
         sharedWorker: LiveStoreSharedWorker
      }),
      schema
   })
}
