import { Cell, useSetupEffect } from 'retend'
import { Modes, getGlobalContext, matchContext } from 'retend/context'

export function useIsServer() {
   const { window } = getGlobalContext()
   const isServer = Cell.source(matchContext(window, Modes.VDom))

   useSetupEffect(() => {
      isServer.set(false)
   })

   return isServer
}
