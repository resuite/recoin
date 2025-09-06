import Loader from '@/components/icons/svg/loader'
import { AuthScope } from '@/scopes/auth'
import { useScopeContext, useSetupEffect } from 'retend'

const Loading = () => {
   const { logIn } = useScopeContext(AuthScope)

   useSetupEffect(() => {
      const timeoutId = setTimeout(() => {
         logIn()
      }, 200)

      return () => {
         clearTimeout(timeoutId)
      }
   })

   return <Loader class='h-2' />
}

export default Loading
