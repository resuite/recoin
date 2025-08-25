import { type Cell, createScope } from 'retend'

export interface AuthenticationScopeValue {
   isAuthenticated: Cell<boolean>
   logIn: (pin: string) => Promise<boolean>
   logOut: () => void
}
export const AuthenticationScope = createScope<AuthenticationScopeValue>('Authentication')
