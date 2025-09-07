import { type ErrorCode, Errors } from '@/api/error'

export function errorCodeToHumanReadable(errorCode: ErrorCode): string {
   switch (errorCode) {
      case Errors.EMAIL_ALREADY_EXISTS:
         return 'This email is already registered.'
      case Errors.UNKNOWN_ERROR_OCCURRED:
         return 'An unexpected error occurred. Please try again later.'
      case Errors.INVALID_GOOGLE_TOKEN:
         return 'The provided Google token does not look valid. Please crosscheck and try again.'
      case Errors.GOOGLE_AUTH_FAILED:
         return 'Google authentication failed. Please try again later.'
      default:
         return 'Unknown error'
   }
}

export function defaultError() {
   return 'An unexpected error occurred. Please try again later.'
}
