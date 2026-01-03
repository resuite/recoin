import { RecoinError } from '@/api/error'
import { errorCodeToHumanReadable } from '@/utilities/error-messages'

interface ErrorMessageProps {
   error: Error
}

export function ErrorMessage(props: ErrorMessageProps) {
   const { error } = props
   if (error instanceof RecoinError) {
      return <>{errorCodeToHumanReadable(error.errorCode)}</>
   }

   return error.message
}
