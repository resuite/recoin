import { Cell } from 'retend'
import { useRouter } from 'retend/router'
import { ToastProvider } from '@/components/ui/toast'
import { WaitingListStateScope } from '@/scopes'

function WaitingList() {
   const router = useRouter()
   return (
      <ToastProvider>
         {() => (
            <WaitingListStateScope.Provider value={{ emailEntered: Cell.source(false) }}>
               {() => <router.Outlet />}
            </WaitingListStateScope.Provider>
         )}
      </ToastProvider>
   )
}

export default WaitingList
