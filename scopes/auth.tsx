import { Cell, createScope } from 'retend'
import type { JSX } from 'retend/jsx-runtime'

type AuthState = null | 'logged-in' | 'new-user' | 'ready'

interface AuthCtx {
   logIn: () => void
   logOut: () => void
   authState: Cell<AuthState>
}

export const AuthScope = createScope<AuthCtx>('Authentication')

interface AuthenticationProviderProps {
   children: () => JSX.Template
}

export function AuthenticationProvider(props: AuthenticationProviderProps) {
   const { children } = props

   const authState = Cell.source<AuthState>(null)

   const logIn = () => {
      authState.set('logged-in')
      setTimeout(() => {
         authState.set('ready')
      }, 3000)
   }

   const logOut = () => {
      authState.set('new-user')
   }

   const ctx = { authState, logIn, logOut }

   return <AuthScope.Provider value={ctx}>{children}</AuthScope.Provider>
}
