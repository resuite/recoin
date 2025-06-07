import type { ErrorCode } from '@/api/error';

export interface SuccessResponse<T> {
   success: true;
   data: T;
}

export interface ErrorResponse {
   success: false;
   code: ErrorCode;
}

export type ServerResponse<T> = Promise<SuccessResponse<T> | ErrorResponse>;

export interface RecoinApiEnv {
   Bindings: Record<string, unknown>;
   Variables: Record<string, unknown>;
}
