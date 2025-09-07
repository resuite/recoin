import { verifyGoogleSignIn } from '@/api/modules/authentication/client'
import type { GoogleCredentialResponse } from '@/integrations/google'
import { useErrorNotifier } from '@/utilities/composables'
import { Cell, createScope } from 'retend'
import type { JSX } from 'retend/jsx-runtime'

type AuthState = 'idle' | 'pending' | 'ready'
interface AuthCtx {
   logIn: (response: GoogleCredentialResponse) => void
   logOut: () => void
   authState: Cell<AuthState>
}

export const AuthScope = createScope<AuthCtx>('Authentication')

interface AuthenticationProviderProps {
   children: () => JSX.Template
}

export function AuthenticationProvider(props: AuthenticationProviderProps) {
   const { children } = props
   const errorNotitifer = useErrorNotifier()

   const resource = Cell.async(verifyGoogleSignIn)
   const authState = Cell.derived(() => {
      if (resource.pending.get()) {
         return 'pending'
      }
      if (resource.data.get()?.success) {
         return 'ready'
      }
      return 'idle'
   })

   resource.error.listen(errorNotitifer)

   const ctx: AuthCtx = {
      authState,
      logIn(response) {
         resource.run(response.credential)
      },
      logOut() {
         resource.data.set(null)
      }
   }

   return <AuthScope.Provider value={ctx}>{children}</AuthScope.Provider>
}
