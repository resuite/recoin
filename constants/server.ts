export const DEFAULT_WORKSPACE = 'Personal'
export const RECOIN_SESSION_COOKIE = 'recoin_session'
export const GOOGLE_JWK_URL = 'https://www.googleapis.com/oauth2/v3/certs'
export const SESSION_EXPIRATION_SECONDS = 60 * 60 * 24 * 30
export const StatusCodes = {
   Ok: 200,
   Created: 201,
   Unauthorized: 401,
   Conflict: 409,
   InternalServerError: 500
} as const
