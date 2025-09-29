import { Button } from '@/components/ui/button'
import { Stage } from '@/pages/app/(fragments)/stage'
import { useAuthContext } from '@/scopes/auth'

export default function Settings() {
   const { logOut } = useAuthContext()

   return (
      <Stage class='grid place-items-center'>
         <div class='text-center'>
            <h1 class='text-title mb-2'>Settings</h1>
            <Button onClick={logOut.run}>Log out</Button>
            <p class='text-body'>Coming soon...</p>
         </div>
      </Stage>
   )
}
