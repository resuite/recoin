import type { ErrorCode } from "./error.ts";

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
   // biome-ignore lint/style/useNamingConvention: Hono expects PascalCase
   Bindings: {};
   // biome-ignore lint/style/useNamingConvention: Hono expects PascalCase
   Variables: {};
}
