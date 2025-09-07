import type { GoogleIdTokenPayload } from '@/api/types'
import { GOOGLE_JWK_URL, RECOIN_SESSION_COOKIE } from '@/constants/shared'
import type { Context } from 'hono'
import { setCookie } from 'hono/cookie'
import { createRemoteJWKSet, jwtVerify } from 'jose'

export function setAuthCookie(context: unknown) {
   const sessionToken = crypto.randomUUID()
   setCookie(context as Context, RECOIN_SESSION_COOKIE, sessionToken, {
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 30
   })
}

export async function verifyGoogleIdToken(idToken: string, clientId: string) {
   const JWKS = createRemoteJWKSet(new URL(GOOGLE_JWK_URL))
   const { payload } = await jwtVerify(idToken, JWKS, {
      issuer: ['accounts.google.com', 'https://accounts.google.com'],
      audience: clientId
   })
   return payload as unknown as GoogleIdTokenPayload
}
