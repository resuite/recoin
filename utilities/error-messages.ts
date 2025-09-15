import { type ErrorCode, Errors } from '@/api/error'

export function errorCodeToHumanReadable(errorCode: ErrorCode): string {
   switch (errorCode) {
      case Errors.EmailAlreadyExists:
         return 'This email is already registered.'
      case Errors.UnknownErrorOccured:
         return 'An unexpected error occurred. Please try again later.'
      case Errors.InvalidGoogleToken:
         return 'The provided Google token does not look valid. Please crosscheck and try again.'
      case Errors.GoogleAuthFailed:
         return 'Google authentication failed. Please try again later.'
      case Errors.UnAuthorized:
         return 'You are not authorized to perform this action. Please log in and try again.'
      default:
         return 'Unknown error'
   }
}

export function defaultError() {
   return 'An unexpected error occurred. Please try again later.'
}
