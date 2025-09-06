import { RecoinError } from '@/api/error'
import { useToast } from '@/components/ui/toast'
import { useRouteQuery } from 'retend/router'
import { defaultError, errorCodeToHumanReadable } from './error-messages'

export function useRouteQueryControl(key: string, value = 'true') {
   const query = useRouteQuery()
   const add = () => {
      query.set(key, value)
   }
   const remove = () => {
      query.delete(key)
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
