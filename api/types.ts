import type { ErrorCode } from '@/api/error'
import type { KVNamespace } from '@cloudflare/workers-types'

export interface SuccessResponse<T = never> {
   success: true
   data: T
}

export interface ErrorResponse {
   success: false
   code: ErrorCode
   details?: unknown
}

export type ServerResponse<T = never> = Promise<
   SuccessResponse<T> | ErrorResponse
>

export interface RecoinApiEnv {
   Bindings: {
      RECOIN_WAITING_LIST: KVNamespace
   }
   Variables: Record<string, unknown>
}
