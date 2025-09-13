import type { UserData } from '@/api/database/types'
import { Errors, RecoinError } from '@/api/error'
import type { ServerResponse } from '@/api/types'

export async function getMe(): ServerResponse<UserData> {
   const res = await fetch('/__api/app/me')
   if (!res.ok) {
      throw new RecoinError(Errors.UNAUTHORIZED)
   }
   return await res.json()
}
