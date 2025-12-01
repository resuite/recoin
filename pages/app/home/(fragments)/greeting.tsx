import { useAuthContext } from '@/scopes/auth'

export function Greeting() {
   const { userData } = useAuthContext()
   const firstName = userData.get()?.firstName
   return (
      <div class='px-1 text-center'>
         <h3 class='text-header'>Hello, {firstName}.</h3>
         <p class='text-sm opacity-60'>Add a new transaction to get started.</p>
      </div>
   )
}
