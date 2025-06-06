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
   CONFIG_NOT_DEFINED: 100,
} as const;

export type ErrorCode = (typeof Errors)[keyof typeof Errors];

/**
 * Custom error class for Recoin errors.
 * Extends the base Error class and adds an error code.
 */
export class RecoinError extends Error {
   errorCode: ErrorCode;
   constructor(errorCode: ErrorCode) {
      super();
      this.errorCode = errorCode;
   }
}
