import { Errors, type ErrorCode } from '@/api/error';

export function errorCodeToHumanReadable(errorCode: ErrorCode): string {
   switch (errorCode) {
      case Errors.EMAIL_ALREADY_EXISTS:
         return 'This email is already registered.';
      case Errors.UNKNOWN_ERROR_OCCURRED:
         return 'An unexpected error occurred. Please try again later.';
      default:
         return 'Unknown error';
   }
}
