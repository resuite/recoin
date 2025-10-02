import { useFullScreenTransitionContext } from '@/components/views/full-screen-transition-view'
import type { RecoinStore } from '@/database/store'
import { useAuthContext } from '@/scopes/auth'
import { animationsSettled } from '@/utilities/animations'
import { tryFn } from '@/utilities/miscellaneous'
import {
   type LiveStoreSchema,
   type QueryBuilder,
   type State,
   type Store,
   queryDb
} from '@livestore/livestore'
import { Cell, If, createScope, useScopeContext, useSetupEffect } from 'retend'
import type { JSX } from 'retend/jsx-runtime'

const LiveStoreScope = createScope()

interface LiveStoreProviderProps<T extends LiveStoreSchema> {
   initStore: (authToken: string) => Promise<Store<T>>
   children: () => JSX.Template
   fallback?: () => JSX.Template
}

/**
 * A provider component that makes a LiveStore instance available to child components
 * via the `LiveStoreScope` context.
 *
 * This component asynchronously initializes the store and renders a fallback
 * component while the store is loading. Once the store is available, it provides
 * it to its children.
 */
export function LiveStoreProvider<T extends LiveStoreSchema>(props: LiveStoreProviderProps<T>) {
   const { initStore, children, fallback } = props
   const { userData } = useAuthContext()
   const { run: startStore, data: store } = Cell.async(initStore)
   const fullScreenTransitionContext = tryFn(() => useFullScreenTransitionContext())

   useSetupEffect(async () => {
      if (fullScreenTransitionContext) {
         // If the store starts loading before the animation ends,
         // it leads to very unfortunate jank as the queries are processed,
         // interferring with the smoothness. The little things.
         await animationsSettled(fullScreenTransitionContext.activeViewRef)
      }
      const user = userData.get()
      if (!user) {
         return
      }
      startStore(user.id)

      return () => {
         store.get()?.shutdown()
      }
   })

   return If(store, {
      true: (store) => {
         if (!store) {
            return fallback?.()
         }
         return <LiveStoreScope.Provider value={store}>{children}</LiveStoreScope.Provider>
      },
      false: fallback
   })
}

type ExtractQueryType<
   ResultSchema,
   Table extends State.SQLite.TableDef,
   Result
> = // biome-ignore lint/suspicious/noExplicitAny: Types are too complex
| QueryBuilder<ResultSchema, Table, any>
| Extract<
     Parameters<typeof queryDb<ResultSchema, Result>>[0] extends infer V
        ? V extends (...args: infer _) => infer X
           ? X
           : never
        : never,
     { query: string }
  >

/**
 * A hook that subscribes to a live database query and returns the results in a Cell.
 * The Cell updates automatically whenever the underlying query results change.
 *
 * @template TResultSchema The expected schema of the query results before mapping.
 * @template TResult The expected schema of the query results after mapping (defaults to TResultSchema).
 */
export function useLiveQuery<
   ResultSchema,
   Table extends State.SQLite.TableDef,
   Result = ResultSchema
>(query: ExtractQueryType<ResultSchema, Table, Result>): Cell<ResultSchema> {
   const store = useScopeContext<Store>(LiveStoreScope)
   const liveQuery$ = queryDb(query)
   const cell = Cell.source<ResultSchema>(store.query(liveQuery$))

   useSetupEffect(() => {
      return store.subscribe(liveQuery$, {
         onUpdate(value) {
            cell.set(value)
         }
      })
   })

   return cell
}

/**
 * A hook that provides access to the LiveStore instance from the nearest `LiveStoreScope.Provider`.
 */
export function useStore() {
   return useScopeContext<RecoinStore>(LiveStoreScope)
}
