import { ToastProvider } from '@/components/ui/toast'
import { WaitingListStateScope } from '@/scopes'
import { Cell } from 'retend'
import { useRouter } from 'retend/router'

function WaitingList() {
   const router = useRouter()
   return (
      <ToastProvider scheme='dark'>
         {() => (
            <WaitingListStateScope.Provider value={{ emailEntered: Cell.source(false) }}>
               {() => <router.Outlet />}
            </WaitingListStateScope.Provider>
         )}
      </ToastProvider>
   )
}

export default WaitingList
