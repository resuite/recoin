import { Cell, useSetupEffect } from 'retend'
import { getGlobalContext, Modes, matchContext } from 'retend/context'

export function useIsServer() {
   const { window } = getGlobalContext()
   const isServer = Cell.source(matchContext(window, Modes.VDom))

   useSetupEffect(() => {
      isServer.set(false)
   })

   return isServer
}
