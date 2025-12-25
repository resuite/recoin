import { Cell, getActiveRenderer, useSetupEffect } from 'retend'
import { VDOMRenderer } from 'retend-server/v-dom'

export function useIsServer() {
   const renderer = getActiveRenderer()
   const isServer = Cell.source(renderer instanceof VDOMRenderer)

   useSetupEffect(() => {
      isServer.set(false)
   })

   return isServer
}
