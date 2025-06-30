import type { ErrorResponse } from '@/api/types'
import type { Context } from 'hono'

/**
 * Constants for error codes used throughout the application.
 * Each error code maps to a unique number.
 *
 * @remarks
 * These error codes are used with the RecoinError class and toHumanReadableError function
 * to provide consistent error handling and messaging.
 *
 * @example
 * ```typescript
 * throw new RecoinError("Config error", Errors.CONFIG_NOT_DEFINED);
 * ```
 */
export const Errors = {
   EMAIL_ALREADY_EXISTS: 101,
   UNKNOWN_ERROR_OCCURRED: 102
} as const

export type ErrorCode = (typeof Errors)[keyof typeof Errors]

/**
 * Returns a success response in JSON format.
 *
 * @param c - The Hono Context object containing request/response data
 * @returns A JSON response with success:true
 *
 * @example
 * ```typescript
 * return success(c); // Returns {success: true}
 * ```
 */
export function success(c: { json: Context['json'] }): Response {
   return c.json({ success: true })
}

/**
 * Returns an error response in JSON format.
 *
 * @param c - The Hono Context object containing request/response data
 * @param errorCode - The error code to include in the response
 * @returns A JSON response with success:false and the error code
 *
 * @example
 * ```typescript
 * return errorOccurred(c, Errors.CONFIG_NOT_DEFINED); // Returns {success: false, code: 100}
 * ```
 */
export function errorOccurred(
   c: { json: Context['json'] },
   errorCode: ErrorCode,
   details?: unknown
): Response {
   return c.json({ success: false, code: errorCode, details } as ErrorResponse)
}

/**
 * Custom error class for Recoin errors.
 * Extends the base Error class and adds an error code.
 */
export class RecoinError extends Error {
   errorCode: ErrorCode
   constructor(errorCode: ErrorCode) {
      super()
      this.errorCode = errorCode
   }
}
