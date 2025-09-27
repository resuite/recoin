import { RecoinError } from '@/api/error'
import { useToast } from '@/components/ui/toast'
import { defer } from '@/utilities/miscellaneous'
import { Cell, useObserver, useSetupEffect } from 'retend'
import { Modes, getGlobalContext, matchContext } from 'retend/context'
import { useRouteQuery, useRouter } from 'retend/router'
import { defaultError, errorCodeToHumanReadable } from './error-messages'

export function useRouteQueryControl(_key: string | { _root: string }, value = 'true') {
   const key = typeof _key === 'string' ? _key : _key._root
   const query = useRouteQuery()
   const router = useRouter()
   const current = router.getCurrentRoute()

   const add = () => {
      query.set(key, value)
   }
   const remove = () => {
      const subKeys = [...current.get().query.keys()].filter((_key) => {
         return _key.startsWith(`${key}.`)
      })
      query.delete(key)
      defer(() => {
         // This tries to prevent any subtle timing/rendering issues
         // that can come from trying to remove all the keys at once.
         query.delete(...subKeys)
      })
   }
   const hasKey = query.has(key)

   return { add, remove, hasKey }
}

export function useErrorNotifier() {
   const { showToast } = useToast()

   return (error: Error | null) => {
      if (!error) {
         return
      }
      if (!(error instanceof RecoinError)) {
         const content = error.message ?? defaultError()
         showToast({ content, duration: 3000 })
         return
      }
      const content = errorCodeToHumanReadable(error.errorCode)
      showToast({ content, duration: 3000 })
   }
}

export function useIsServer() {
   const { window } = getGlobalContext()
   const isServer = Cell.source(matchContext(window, Modes.VDom))

   useSetupEffect(() => {
      isServer.set(false)
   })

   return isServer
}

export function useHrefWithAppendedParams(record: Record<string, string>) {
   const router = useRouter()
   const currentRoute = router.getCurrentRoute().get()
   const query = new URLSearchParams(currentRoute.query)
   for (const [key, value] of Object.entries(record)) {
      query.append(key, value)
   }
   return `${currentRoute.path}?${query}`
}

export function useTextContentLength(ref: Cell<HTMLElement | null>): Cell<number> {
   const observer = useObserver()
   const count = Cell.source(0)

   observer.onConnected(ref, (element) => {
      const update = () => {
         // This should be element.innerText, to cater for hidden text
         // and such, but element.innerText causes too many reflows and
         // cracks the initial slide-up animation.
         count.set(element.textContent?.length ?? 0)
      }
      update()
      const observer = new MutationObserver(update)
      observer.observe(element, {
         characterData: true,
         childList: true,
         subtree: true
      })

      return () => observer.disconnect()
   })

   return count
}

type GetterFunction<Output> = () => Promise<Output>
type Resource<Output> =
   | { state: 'pending' }
   | { state: 'error'; error: Error }
   | { state: 'complete'; data: Output }

export function usePromise<Output>(getter: GetterFunction<Output>): Cell<Resource<Output>> {
   const resource = Cell.async(getter)
   const notifier = useErrorNotifier()

   useSetupEffect(() => {
      resource.run()
   })

   resource.pending.set(true)
   resource.error.listen(notifier)

   return Cell.derived(() => {
      if (resource.pending.get()) {
         return { state: 'pending' }
      }

      const error = resource.error.get()
      if (error) {
         return { state: 'error', error }
      }

      const data = resource.data.get()
      return { state: 'complete', data: data as Awaited<Output> }
   })
}
