import Add from '@/components/icons/svg/add'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { ExpandingView } from '@/components/views'
import { QUERY_KEYS } from '@/constants/query-keys'
import TransactionFlow from '@/pages/app/transaction-flow'
import { useRouteQueryControl } from '@/utilities/composables'

export function AddNewTransactionButton() {
   const {
      add: startNewTransactionFlow,
      hasKey: transactionFlowIsOpen,
      remove: closeNewTransactionFlow
   } = useRouteQueryControl(QUERY_KEYS.TransactionFlow._root)

   const toggleState = () => {
      if (transactionFlowIsOpen.get()) {
         closeNewTransactionFlow()
      } else {
         startNewTransactionFlow()
      }
   }

   return (
      <>
         <FloatingActionButton
            class={[{ 'rotate-135 dark-scheme': transactionFlowIsOpen }]}
            inline='center'
            block='bottom'
            onClick={toggleState}
         >
            <Add />
         </FloatingActionButton>
         <ExpandingView
            isOpen={transactionFlowIsOpen}
            class='dark-scheme'
            expandOrigin='auto auto calc(var(--spacing) * 3) calc(50% - var(--fab-size) / 2)'
         >
            {TransactionFlow}
         </ExpandingView>
      </>
   )
}
