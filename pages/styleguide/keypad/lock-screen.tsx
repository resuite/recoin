import RecoinBaseIcon from '@/components/icons/svg/recoin'
import { PinInput } from '@/components/ui/pin-input'
import { StackView } from '@/components/views'
import { useRouteQueryControl } from '@/utilities/composables'
import { useScopeContext } from 'retend'
import { AuthenticationScope } from './scope'

export function LockScreenContent() {
   const { add: goToAuthPage, hasKey: authPageOpen } = useRouteQueryControl('authenticated')
   const { logIn } = useScopeContext(AuthenticationScope)

   return (
      <div class='h-screen grid place-content-center place-items-center gap-3'>
         <div class='grid place-items-center'>
            <RecoinBaseIcon class='w-2.5' />
            <h2 class='text-header'>Enter Pin to continue</h2>
         </div>
         <PinInput onFill={logIn} onSuccess={goToAuthPage} disabled={authPageOpen} />
      </div>
   )
}

export function LockScreen() {
   return <StackView root>{LockScreenContent}</StackView>
}
