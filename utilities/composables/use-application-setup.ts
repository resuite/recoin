import { useAuthContext } from '@/scopes/auth'
import { Cell, useSetupEffect } from 'retend'

export function useApplicationSetup() {
   const { userData } = useAuthContext()
   const waitTimeLoaded = Cell.source(false)

   const ready = Cell.derived(() => {
      return userData.get() !== null && waitTimeLoaded.get()
   })

   const hasFinishedOnboarding = Cell.derived(() => {
      return Boolean(userData.get()?.workspaces[0]?.currency)
   })

   useSetupEffect(() => {
      const timeout = setTimeout(() => {
         waitTimeLoaded.set(true)
      }, 200)

      return () => clearTimeout(timeout)
   })

   return { hasFinishedOnboarding, ready }
}
