import { RecoinError } from '@/api/error'
import { useToast } from '@/components/ui/toast'
import { defaultError, errorCodeToHumanReadable } from '../error-messages'

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
