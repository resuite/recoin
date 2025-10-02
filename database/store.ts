import LiveStoreWorker from '@/database/livestore.worker?worker'
import { schema } from '@/database/schema'
import { makePersistedAdapter } from '@livestore/adapter-web'
import LiveStoreSharedWorker from '@livestore/adapter-web/shared-worker?sharedworker'
import type { Store } from '@livestore/livestore'
import { createStorePromise } from '@livestore/livestore'
import { SharedWorkerPolyfill as SharedWorker } from '@okikio/sharedworker'

export type RecoinStore = Store<typeof schema>

// @ts-expect-error: TODO: Revisit this in 100 years, when Chrome Android finally implements SharedWorker
globalThis.SharedWorker ??= SharedWorker

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
