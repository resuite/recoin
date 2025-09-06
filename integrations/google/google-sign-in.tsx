import Loader from '@/components/icons/svg/loader'
import { type GoogleCredentialResponse, useGoogleSignInButton } from '@/integrations/google'
import { Cell } from 'retend'

interface GoogleSignInProps {
   onSuccess: (res: GoogleCredentialResponse) => void
}

export const GoogleSignIn = (props: GoogleSignInProps) => {
   const buttonRef = Cell.source<HTMLButtonElement | null>(null)
   useGoogleSignInButton(buttonRef, props)

   return (
      <button
         type='button'
         ref={buttonRef}
         class='button-bare min-h-[60px] max-w-fit grid grid-flow-col place-items-center gap-0.5'
      >
         {/* Placeholder while the Google button loads. */}
         <div class='bg-light-yellow light-scheme grid place-items-center h-[40px] w-[300px] rounded-3xl'>
            <Loader class='h-1/2' />
         </div>
      </button>
   )
}
