import { type GoogleCredentialResponse, useGoogleSignInButton } from '@/scopes/google'
import { Cell } from 'retend'

interface GoogleSignInProps {
   onSuccess: (res: GoogleCredentialResponse) => void
   onError: () => void
}

export const GoogleSignIn = (props: GoogleSignInProps) => {
   const buttonRef = Cell.source<HTMLButtonElement | null>(null)
   useGoogleSignInButton(buttonRef, props)

   return (
      <button
         type='button'
         ref={buttonRef}
         class='button-bare min-h-[60px] max-w-fit grid grid-flow-col place-items-center gap-0.5'
      />
   )
}
