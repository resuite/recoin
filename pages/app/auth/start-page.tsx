import Loading from '@/pages/app/auth/loading'
import Welcome from '@/pages/app/auth/welcome'
import { useAuthContext } from '@/scopes/auth'
import { Cell, If } from 'retend'

const StartPage = () => {
   const { authState } = useAuthContext()
   const isIdle = Cell.derived(() => {
      return authState.get() === 'idle'
   })

   return (
      <div class='grid place-items-center gap-1 place-content-center'>
         {If(isIdle, {
            true: Welcome,
            false: Loading
         })}
      </div>
   )
}

export default StartPage
