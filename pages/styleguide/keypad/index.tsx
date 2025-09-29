import { StackViewGroup } from '@/components/views/stack-view-group'
import { useRouteQueryControl } from '@/utilities/composables/use-route-query-control'
import { Cell } from 'retend'
import { AuthScreen } from './auth-screen'
import { LockScreen } from './lock-screen'
import { AuthenticationScope, type AuthenticationScopeValue } from './scope'

const KeypadTest = () => {
   const correctPin = '1234'
   const isAuthenticated = Cell.source(false)
   const { remove: removeAuthRoute } = useRouteQueryControl('authenticated')

   const logIn = async (value: string) => {
      if (value === correctPin) {
         isAuthenticated.set(true)
         return true
      }

      await new Promise((resolve) => setTimeout(resolve, 300))
      return false
   }

   const logOut = () => {
      isAuthenticated.set(false)
      removeAuthRoute()
   }

   const authCtx: AuthenticationScopeValue = { isAuthenticated, logIn, logOut }

   return (
      <AuthenticationScope.Provider value={authCtx}>
         {() => (
            <StackViewGroup>
               <LockScreen />
               <AuthScreen />
            </StackViewGroup>
         )}
      </AuthenticationScope.Provider>
   )
}

export default KeypadTest
