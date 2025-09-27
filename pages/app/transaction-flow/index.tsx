import { usePullToRefreshContext, useSidebarContext } from '@/components/views'
import { FullScreenTransitionView } from '@/components/views/full-screen-transition-view'
import { QueryKeys } from '@/constants/query-keys'
import ChooseCategory from '@/pages/app/transaction-flow/choose-category'
import ChooseTransactionType from '@/pages/app/transaction-flow/choose-transaction-type'
import EnterTransactionDetails from '@/pages/app/transaction-flow/enter-transaction-details'
import { TransactionDetailsFormScope } from '@/scopes/forms'
import { Cell, useScopeContext, useSetupEffect } from 'retend'
import { useRouteQuery } from 'retend/router'

const TransactionFlow = () => {
   const query = useRouteQuery()
   const form = useScopeContext(TransactionDetailsFormScope)
   const { toggleSidebarEnabled } = useSidebarContext()
   const { togglePullToRefreshEnabled } = usePullToRefreshContext()
   const type = query.get(QueryKeys.TransactionFlow.Type)
   const category = query.get(QueryKeys.TransactionFlow.Category)
   const typeChosen = Cell.derived(() => {
      return type.get() !== null
   })
   const categoryChosen = Cell.derived(() => {
      return category.get() !== null
   })

   useSetupEffect(() => {
      toggleSidebarEnabled(false)
      togglePullToRefreshEnabled(false)
      return () => {
         toggleSidebarEnabled(true)
         togglePullToRefreshEnabled(true)
         form.reset()
      }
   })

   return (
      <FullScreenTransitionView
         when={typeChosen}
         transition='blink'
         speed='default'
         from={ChooseTransactionType}
         to={() => (
            <FullScreenTransitionView
               when={categoryChosen}
               transition='blink'
               speed='default'
               from={ChooseCategory}
               to={EnterTransactionDetails}
            />
         )}
      />
   )
}

export default TransactionFlow
