import RecoinBaseIcon from '@/components/icons/svg/recoin'
import { PinInput } from '@/components/ui/pin-input'
import { StackView, useStackViewFocusEffect } from '@/components/views'
import { useRouteQueryControl } from '@/utilities/composables'
import { Cell, useScopeContext } from 'retend'
import { AuthenticationScope } from './scope'

export function LockScreenContent() {
   const { add: goToAuthPage } = useRouteQueryControl('authenticated')
   const { logIn } = useScopeContext(AuthenticationScope)
   const ref = Cell.source<HTMLElement | null>(null)
   const keypadEnabled = Cell.source(true)
   const keypadDisabled = Cell.derived(() => !keypadEnabled.get())

   useStackViewFocusEffect(ref, () => {
      keypadEnabled.set(true)
      return () => {
         keypadEnabled.set(false)
      }
   })

   return (
      <div ref={ref} class='h-screen grid place-content-center place-items-center gap-3'>
         <div class='grid place-items-center'>
            <RecoinBaseIcon class='w-2.5' />
            <h2 class='text-header'>Enter Pin to continue</h2>
         </div>
         <PinInput onFill={logIn} onSuccess={goToAuthPage} disabled={keypadDisabled} />
      </div>
   )
}

export function LockScreen() {
   return <StackView root>{LockScreenContent}</StackView>
}
