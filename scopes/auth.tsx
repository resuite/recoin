import { Cell, createScope, useScopeContext, useSetupEffect } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import { useLocalStorage } from 'retend-utils/hooks'
import type { UserData } from '@/api/database/types'
import { Errors, RecoinError } from '@/api/error'
import { completeOnboarding, getMe } from '@/api/modules/application/client'
import { logOutUser, verifyGoogleSignIn } from '@/api/modules/authentication/client'
import { LocalStorageKeys } from '@/constants/local-storage-keys'
import { useErrorNotifier } from '@/utilities/composables/use-error-notifier'

type AuthState = 'idle' | 'pending' | 'ready'

interface AuthCtx {
   userData: Cell<UserData | null>
   currency: Cell<string>
   logInWithGoogle: ReturnType<typeof Cell.async<typeof verifyGoogleSignIn>>
   logOut: ReturnType<typeof Cell.async<typeof logOutUser>>
   authState: Cell<AuthState>
   completeSetup: ReturnType<typeof Cell.async<typeof completeOnboarding>>
}

const AuthScope = createScope<AuthCtx>('Authentication')

interface AuthenticationProviderProps {
   children: () => JSX.Template
}

export function AuthenticationProvider(props: AuthenticationProviderProps) {
   const { children } = props
   const errorNotifier = useErrorNotifier()
   const cachedUser = useLocalStorage<UserData | null>(LocalStorageKeys.UserData, null)

   const logInWithGoogle = Cell.async(verifyGoogleSignIn)
   const completeSetup = Cell.async(completeOnboarding)
   const logOut = Cell.async(logOutUser)
   const sessionCheck = Cell.async(getMe)
   const isInitRun = Cell.source(true)

   const authState = Cell.derived(() => {
      if (
         cachedUser.get() ||
         isInitRun.get() ||
         sessionCheck.pending.get() ||
         logInWithGoogle.pending.get()
      ) {
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

      return null as unknown as UserData
   })

   const currency = Cell.derived(() => {
      return userData.get()?.workspaces.at(0)?.currency as string
   })

   const setUserData = (data: UserData | null) => {
      Cell.batch(() => {
         cachedUser.set(data)
         logInWithGoogle.data.set(data ? { data: data, success: true } : null)
         sessionCheck.data.set(data ? { data: data, success: true } : null)
      })
   }

   useSetupEffect(() => {
      isInitRun.set(false)
      sessionCheck.run()
   })

   sessionCheck.data.listen((data) => {
      if (data?.success) {
         cachedUser.set(data.data)
      }
   })

   sessionCheck.error.listen((error) => {
      if (error && error instanceof RecoinError && error.errorCode === Errors.UnAuthorized) {
         cachedUser.set(null)
      }
   })
   logInWithGoogle.error.listen(errorNotifier)
   logOut.error.listen(errorNotifier)
   logOut.data.listen((data) => {
      if (data?.success) {
         setUserData(null)
      }
   })
   completeSetup.data.listen((data) => {
      if (data?.success) {
         setUserData(data.data)
      }
   })

   const ctx: AuthCtx = {
      authState,
      logInWithGoogle,
      userData,
      logOut,
      completeSetup,
      currency
   }

   return <AuthScope.Provider value={ctx}>{children}</AuthScope.Provider>
}

export function useAuthContext() {
   return useScopeContext(AuthScope)
}
