import { Cell, useSetupEffect } from 'retend'

export function useIsServer() {
   const isServer = Cell.source(import.meta.env.SSR)

   useSetupEffect(() => {
      isServer.set(false)
   })

   return isServer
}
