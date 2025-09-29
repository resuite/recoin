import { Button } from '@/components/ui/button'
import { StackView } from '@/components/views'
import { useRouteQueryControl } from '@/utilities/composables/use-route-query-control'
import { useScopeContext } from 'retend'
import { AuthenticationScope } from './scope'

export function AuthScreenContent() {
   const { isAuthenticated, logOut } = useScopeContext(AuthenticationScope)

   if (!isAuthenticated.get()) {
      logOut()
   }

   return (
      <div class='h-screen w-screen grid gap-y-1 place-items-center place-content-center'>
         <h1 class='text-header'>recoin.</h1>
         <Button type='button' onClick={logOut}>
            Lock screen
         </Button>
      </div>
   )
}

export function AuthScreen() {
   const { hasKey: authScreenLoaded } = useRouteQueryControl('authenticated')

   return <StackView isOpen={authScreenLoaded}>{AuthScreenContent}</StackView>
}
