import { RecoinError } from '@/api/error'
import { useToast } from '@/components/toast'
import { defaultError, errorCodeToHumanReadable } from '../error-messages'

export function useErrorNotifier() {
   const { showToast } = useToast()

   return (error: Error | null) => {
      if (!error) {
         return
      }
      if (!(error instanceof RecoinError)) {
         const content = error.message ?? defaultError()
         showToast({ content })
         return
      }
      const content = errorCodeToHumanReadable(error.errorCode)
      showToast({ content })
   }
}
