import { usePullToRefreshContext, useSidebarContext } from '@/components/views'
import { FullScreenTransitionView } from '@/components/views/full-screen-transition-view'
import { QueryKeys } from '@/constants/query-keys'
import ChooseCategory from '@/pages/app/transaction-flow/choose-category'
import ChooseTransactionType from '@/pages/app/transaction-flow/choose-transaction-type'
import { Cell, useSetupEffect } from 'retend'
import { useRouteQuery } from 'retend/router'

const TransactionFlow = () => {
   const query = useRouteQuery()
   const { toggleSidebarEnabled } = useSidebarContext()
   const { togglePullToRefreshEnabled } = usePullToRefreshContext()
   const type = query.get(QueryKeys.TransactionFlow.Type)
   const typeChosen = Cell.derived(() => {
      return type.get() !== null
   })

   useSetupEffect(() => {
      toggleSidebarEnabled(false)
      togglePullToRefreshEnabled(false)
      return () => {
         toggleSidebarEnabled(true)
         togglePullToRefreshEnabled(true)
      }
   })

   return (
      <FullScreenTransitionView
         when={typeChosen}
         transition='blink'
         speed='default'
         from={ChooseTransactionType}
         to={ChooseCategory}
      />
   )
}

export default TransactionFlow
