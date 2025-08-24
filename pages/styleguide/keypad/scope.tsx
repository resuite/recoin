import { type Cell, createScope } from 'retend'

export interface AuthenticationScopeValue {
   isAuthenticated: Cell<boolean>
   goBackHome: () => void
}
export const AuthenticationScope = createScope<AuthenticationScopeValue>('Authentication')
