import { RecoinError } from '@/api/error'
import type { ServerResponse } from '@/api/types'
import { BASE_URL } from '@/constants'

export async function addEmailToWaitingList(email: string): ServerResponse {
   const endpoint = `${BASE_URL}/api/waiting-list`
   const requestInit: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
   }

   const res = await fetch(endpoint, requestInit)
   const data = (await res.json()) as unknown as Awaited<ServerResponse>
   if (!data.success) {
      throw new RecoinError(data.code)
   }
   return data
}
