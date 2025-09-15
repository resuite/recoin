import type { GoogleIdTokenPayload, RecoinApiEnv } from '@/api/types'
import {
   GOOGLE_JWK_URL,
   RECOIN_SESSION_COOKIE,
   SESSION_EXPIRATION_SECONDS
} from '@/constants/server'
import type { Context } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { createRemoteJWKSet, jwtVerify } from 'jose'

export async function setAuthCookie(context: Context<RecoinApiEnv>, userId: string) {
   const isProduction = context.env.CF_ENVIRONMENT === 'production'
   const sessionToken = crypto.randomUUID()
   await context.env.RECOIN_SESSIONS.put(sessionToken, userId, {
      expirationTtl: SESSION_EXPIRATION_SECONDS
   })
   setCookie(context, RECOIN_SESSION_COOKIE, sessionToken, {
      path: '/',
      secure: isProduction,
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: SESSION_EXPIRATION_SECONDS
   })
}

export async function clearAuthCookie(context: Context<RecoinApiEnv>) {
   const sessionToken = getCookie(context, RECOIN_SESSION_COOKIE)
   if (sessionToken) {
      await context.env.RECOIN_SESSIONS.delete(sessionToken)
   }
   deleteCookie(context, RECOIN_SESSION_COOKIE, { path: '/' })
}

export async function verifyGoogleIdToken(idToken: string, clientId: string) {
   const JWKS = createRemoteJWKSet(new URL(GOOGLE_JWK_URL))
   const { payload } = await jwtVerify(idToken, JWKS, {
      issuer: ['accounts.google.com', 'https://accounts.google.com'],
      audience: clientId
   })
   return payload as unknown as GoogleIdTokenPayload
}
