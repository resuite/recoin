import { useScopeContext } from 'retend'
import { AuthenticationScope } from './scope'

export function AuthenticatedScreen() {
   const { isAuthenticated, goBackHome } = useScopeContext(AuthenticationScope)

   if (!isAuthenticated.get()) {
      goBackHome()
   }

   return (
      <div class='h-screen w-screen grid gap-y-1 place-items-center place-content-center'>
         <h1 class='text-header'>recoin.</h1>
         <button type='button' onClick={goBackHome}>
            Lock screen.
         </button>
      </div>
   )
}
