import type { UserData } from '@/api/database/types'
import { RecoinError } from '@/api/error'
import type { ServerResponse } from '@/api/types'

export async function verifyGoogleSignIn(credential: string): ServerResponse<UserData> {
   const requestInit: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
   }

   const res = await fetch('/__api/auth/google/callback', requestInit)
   const data = (await res.json()) as unknown as Awaited<ServerResponse>

   if (!data.success) {
      throw new RecoinError(data.code)
   }
   return data
}

export async function logOutUser(): ServerResponse {
   const requestInit: RequestInit = { method: 'POST' }

   const res = await fetch('/__api/auth/logout', requestInit)
   const data = (await res.json()) as unknown as Awaited<ServerResponse>

   if (!data.success) {
      throw new RecoinError(data.code)
   }
   return data
}
