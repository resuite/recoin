import Loading from '@/pages/app/auth/loading'
import Welcome from '@/pages/app/auth/welcome'
import { AuthScope } from '@/scopes/auth'
import { Cell, If, useScopeContext } from 'retend'

const StartPage = () => {
   const { authState } = useScopeContext(AuthScope)
   const isNewUser = Cell.derived(() => {
      return authState.get() === 'new-user'
   })

   return (
      <div class='grid place-items-center gap-1 place-content-center'>
         {If(isNewUser, {
            true: Welcome,
            false: Loading
         })}
      </div>
   )
}

export default StartPage
