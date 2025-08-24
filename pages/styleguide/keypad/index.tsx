import RecoinBaseIcon from '@/components/icons/svg/recoin'
import { PinInput } from '@/components/ui/pin-input'
import { StackView, StackViewGroup } from '@/components/views'
import { useRouteQueryControl } from '@/utilities/composables'
import { Cell } from 'retend'
import { AuthenticationScope, type AuthenticationScopeValue } from './scope'
import { AuthenticatedScreen } from './second-page'

const KeypadTest = () => {
   const {
      add: authenticate,
      hasKey: onNextPage,
      remove: removeAuthentication
   } = useRouteQueryControl('authenticated')
   const correctPin = 1234
   const isAuthenticated = Cell.source(false)
   const handlePinFill = async (value: number) => {
      if (value === correctPin) {
         return true
      }
      await new Promise((resolve) => setTimeout(resolve, 700))
      return false
   }

   const handleSuccess = () => {
      isAuthenticated.set(true)
      authenticate()
   }

   const goBackHome = () => {
      isAuthenticated.set(false)
      removeAuthentication()
   }

   const authCtx: AuthenticationScopeValue = { isAuthenticated, goBackHome }

   return (
      <AuthenticationScope.Provider value={authCtx}>
         {() => (
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
               <StackView isOpen={onNextPage} onCloseRequested={goBackHome}>
                  {AuthenticatedScreen}
               </StackView>
            </StackViewGroup>
         )}
      </AuthenticationScope.Provider>
   )
}

export default KeypadTest
