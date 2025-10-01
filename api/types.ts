import type { ErrorCode } from '@/api/error'
import type { D1Database, DurableObjectNamespace, KVNamespace } from '@cloudflare/workers-types'

export interface SuccessResponse<T = never> {
   success: true
   data: T
}

export interface ErrorResponse {
   success: false
   code: ErrorCode
   details?: unknown
}

export type ServerResponse<T = never> = Promise<SuccessResponse<T> | ErrorResponse>

export interface RecoinApiEnv {
   Bindings: {
      RECOIN_WAITING_LIST: KVNamespace
      RECOIN_SESSIONS: KVNamespace
      ADMIN_SECRET: string
      DB: D1Database
      LIVESTORE_SYNC: DurableObjectNamespace

      CF_GOOGLE_CLIENT_ID: string
      CF_GOOGLE_CLIENT_SECRET: string
      CF_GOOGLE_PROJECT_ID: string
      CF_ENVIRONMENT: 'development' | 'production'
   }
   Variables: {
      userId?: string
   }
}

export interface GoogleIdTokenPayload {
   iss: string
   azp: string
   aud: string
   sub: string
   email: string
   email_verified: boolean
   nbf: number
   name: string
   picture: string
   given_name: string
   family_name: string
   iat: number
   exp: number
   jti: string
}
