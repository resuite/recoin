import { Cell } from 'retend'
import { useLocalStorage } from 'retend-utils/hooks'
import { Button } from '@/components/button'
import { useToast } from '@/components/toast'
import { LocalStorageKeys } from '@/constants/local-storage-keys'
import { PageHeading } from '@/pages/app/(fragments)/page-heading'
import { Stage } from '@/pages/app/(fragments)/stage'
import { useAuthContext } from '@/scopes/auth'
import { getDeviceId, initRemoteConsole } from '@/utilities/remote-console'

export default function Settings() {
   const { logOut } = useAuthContext()
   const { showToast } = useToast()
   const isConsoleForwardingEnabled = useLocalStorage<boolean>(
      LocalStorageKeys.RemoteConsoleEnabled,
      false
   )
   const deviceId = getDeviceId()

   const handleToggleRemoteConsole = () => {
      const newState = !isConsoleForwardingEnabled.get()
      isConsoleForwardingEnabled.set(newState)

      if (newState) {
         initRemoteConsole()
         showToast({
            content: (
               <div>
                  <strong>Remote Console Enabled</strong>
                  <br />
                  <span class='text-body opacity-75'>Device: {deviceId}</span>
               </div>
            ),
            duration: 3000
         })
      } else {
         showToast({
            content: 'Remote Console Disabled',
            duration: 2000
         })
      }
   }

   const buttonLabel = Cell.derived(() => (isConsoleForwardingEnabled.get() ? 'ON' : 'OFF'))

   return (
      <Stage class='grid grid-rows-[auto_auto_1fr]'>
         {() => (
            <>
               <PageHeading title='Settings' />
               <ul class='w-full p-1'>
                  <li class='grid grid-cols-[1fr_auto] items-center gap-0.5 border-b-2 py-0.5'>
                     <div>
                        <span class='text-big'>Remote Console</span>
                        <p class='text-body opacity-60'>Device: {deviceId}</p>
                     </div>
                     <Button
                        onClick={handleToggleRemoteConsole}
                        class={[
                           'btn-outline px-0.75 py-0.25',
                           { 'border-canvas-text': isConsoleForwardingEnabled }
                        ]}
                     >
                        {buttonLabel}
                     </Button>
                  </li>
                  <li class='border-b-2 py-0.5'>
                     <Button
                        class='w-full button-bare text-canvas-text text-left text-big'
                        onClick={() => window.location.reload()}
                     >
                        Force Reload
                     </Button>
                  </li>
                  <li class='border-b-2 py-0.5'>
                     <Button
                        class='w-full button-bare text-canvas-text text-left text-big'
                        onClick={logOut.run}
                     >
                        Log out
                     </Button>
                  </li>
               </ul>
            </>
         )}
      </Stage>
   )
}
