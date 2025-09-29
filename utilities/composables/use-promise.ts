import { Cell, useSetupEffect } from 'retend'
import { useErrorNotifier } from './use-error-notifier'

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
