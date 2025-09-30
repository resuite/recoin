import type { UserData } from '@/api/database/types'
import { Errors, RecoinError } from '@/api/error'
import type { ServerResponse } from '@/api/types'

export async function getMe(): ServerResponse<UserData> {
   const res = await fetch('/__api/app/me')
   if (!res.ok) {
      throw new RecoinError(Errors.UnAuthorized)
   }
   return await res.json()
}

interface OnboardingDetails {
   currency: string
   startingBalance: number
}

export async function completeOnboarding(data: OnboardingDetails): ServerResponse<UserData> {
   const res = await fetch('/__api/app/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
   })

   if (!res.ok) {
      throw new RecoinError(Errors.UnknownErrorOccured)
   }

   return await res.json()
}
