import { WaitingListStateScope } from '@/scopes'
import { Cell } from 'retend'
import { useRouter } from 'retend/router'

function WaitingList() {
   const router = useRouter()
   return (
      <WaitingListStateScope.Provider value={{ emailEntered: Cell.source(false) }}>
         {() => <router.Outlet />}
      </WaitingListStateScope.Provider>
   )
}

export default WaitingList
