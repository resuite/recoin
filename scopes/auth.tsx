import type { UserData } from '@/api/database/types'
import { getMe } from '@/api/modules/application/client'
import { logOutUser, verifyGoogleSignIn } from '@/api/modules/authentication/client'
import type { ErrorResponse, SuccessResponse } from '@/api/types'
import { useErrorNotifier } from '@/utilities/composables'
import type { Resource } from '@/utilities/miscellaneous'
import { Cell, createScope, useScopeContext, useSetupEffect } from 'retend'
import { useLocalStorage } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'

type AuthState = 'idle' | 'pending' | 'ready'
interface AuthCtx {
   userData: Cell<UserData | null>
   logInWithGoogle: Resource<string, ErrorResponse | SuccessResponse<UserData>>
   logOut: Resource<unknown, ErrorResponse | SuccessResponse<never>>
   authState: Cell<AuthState>
}

const AuthScope = createScope<AuthCtx>('Authentication')

interface AuthenticationProviderProps {
   children: () => JSX.Template
}

export function AuthenticationProvider(props: AuthenticationProviderProps) {
   const { children } = props
   const errorNotitifer = useErrorNotifier()
   const cachedUser = useLocalStorage<UserData | null>('userData', null)

   const logInWithGoogle = Cell.async(verifyGoogleSignIn)
   const logOut = Cell.async(logOutUser)
   const sessionCheck = Cell.async(getMe)

   const authState = Cell.derived(() => {
      if (sessionCheck.pending.get() || logInWithGoogle.pending.get()) {
         return 'pending'
      }
      if (sessionCheck.data.get()?.success || logInWithGoogle.data.get()?.success) {
         return 'ready'
      }
      return 'idle'
   })

   const userData = Cell.derived(() => {
      const sessionData = sessionCheck.data.get()
      if (sessionData?.success) {
         return sessionData.data
      }

      const logInData = logInWithGoogle.data.get()
      if (logInData?.success) {
         return logInData.data
      }

      const cachedUserData = cachedUser.get()
      if (cachedUserData) {
         return { ...cachedUserData }
      }

      return null
   })

   useSetupEffect(() => {
      sessionCheck.run()
   })

   sessionCheck.data.listen((data) => {
      if (data?.success) {
         cachedUser.set(data.data)
      }
   })
   logInWithGoogle.error.listen(errorNotitifer)
   logOut.error.listen(errorNotitifer)
   logOut.data.listen((data) => {
      if (data?.success) {
         Cell.batch(() => {
            cachedUser.set(null)
            logInWithGoogle.data.set(null)
            sessionCheck.data.set(null)
         })
      }
   })

   const ctx: AuthCtx = { authState, logInWithGoogle, userData, logOut }

   return <AuthScope.Provider value={ctx}>{children}</AuthScope.Provider>
}

export function useAuthContext() {
   return useScopeContext(AuthScope)
}
