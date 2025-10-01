import { useAuthContext } from '@/scopes/auth'

export function useWorkspaceId(): string {
   const { userData } = useAuthContext()
   return userData.get()?.workspaces.at(0)?.id || ''
}
