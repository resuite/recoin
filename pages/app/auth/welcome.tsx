import RecoinBaseIcon from '@/components/icons/svg/recoin'
import type { GoogleCredentialResponse } from '@/integrations/google'
import { GoogleSignIn } from '@/integrations/google/google-sign-in'
import { AuthScope } from '@/scopes/auth'
import { useScopeContext } from 'retend'

const Welcome = () => {
   const { logIn } = useScopeContext(AuthScope)

   const handleGoogleSignInSuccess = (_response: GoogleCredentialResponse) => {
      logIn()
   }

   return (
      <div class='grid h-screen w-screen justify-center grid-rows-[.9fr_auto]'>
         <div class='text-center animate-stagger-load grid place-items-center place-content-center'>
            <RecoinBaseIcon class='h-3' />
            <h1 class='text-3xl'>Welcome to recoin.</h1>
            <p class='font-thin pt-0.5'>Take control of your financial life.</p>
         </div>
         <div>
            <GoogleSignIn onSuccess={handleGoogleSignInSuccess} />
         </div>
      </div>
   )
}

export default Welcome
