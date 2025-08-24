import RecoinBaseIcon from '@/components/icons/svg/recoin'
import { PinInput } from '@/components/ui/pin-input'
import { StackView, StackViewGroup } from '@/components/views'
import { useRouteQueryControl } from '@/utilities/composables'

const KeypadTest = () => {
   const {
      add: authenticate,
      hasKey: isAuthenticated,
      remove: removeAuthentication
   } = useRouteQueryControl('authenticated')
   const correctPin = 1234
   const handlePinFill = async (value: number) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return value === correctPin
   }

   const handleSuccess = () => {
      authenticate()
   }

   return (
      <StackViewGroup>
         <StackView root>
            {() => (
               <div class='h-screen grid place-content-center place-items-center gap-3'>
                  <div class='grid place-items-center'>
                     <RecoinBaseIcon class='w-2.5' />
                     <h2 class='text-header'>Enter Pin to continue</h2>
                  </div>
                  <PinInput onFill={handlePinFill} onSuccess={handleSuccess} />
               </div>
            )}
         </StackView>
         <StackView isOpen={isAuthenticated} onCloseRequested={removeAuthentication}>
            {() => (
               <div class='h-screen w-screen grid gap-y-1 place-items-center place-content-center'>
                  <h1 class='text-header'>recoin.</h1>
                  <button type='button' onClick={removeAuthentication}>
                     Lock screen.
                  </button>
               </div>
            )}
         </StackView>
      </StackViewGroup>
   )
}

export default KeypadTest
