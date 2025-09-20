import Add from '@/components/icons/svg/add'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { ExpandingView } from '@/components/views'
import { ROOT_APP_OUTLET } from '@/constants'
import { QueryKeys } from '@/constants/query-keys'
import { VibrationPatterns } from '@/constants/vibration'
import TransactionFlow from '@/pages/app/transaction-flow'
import { type NewTransactionDetails, NewTransactionDetailsScope } from '@/scopes/forms'
import { useRouteQueryControl } from '@/utilities/composables'
import { vibrate } from '@/utilities/miscellaneous'
import { Cell } from 'retend'
import { Teleport } from 'retend/teleport'

export function AddNewTransactionButton() {
   const {
      add: startNewTransactionFlow,
      hasKey: transactionFlowIsOpen,
      remove: closeNewTransactionFlow
   } = useRouteQueryControl(QueryKeys.TransactionFlow)
   const { hasKey: isOnTransactionDetailsPage } = useRouteQueryControl(
      QueryKeys.TransactionFlow.Category
   )

   const details: NewTransactionDetails = {
      amount: Cell.source(0),
      label: Cell.source('')
   }

   const amountFilled = Cell.derived(() => {
      return details.amount.get() > 0 && isOnTransactionDetailsPage.get()
   })

   const toggleState = () => {
      vibrate(VibrationPatterns.ButtonPress)
      if (transactionFlowIsOpen.get()) {
         closeNewTransactionFlow()
      } else {
         startNewTransactionFlow()
      }
   }

   return (
      <NewTransactionDetailsScope.Provider value={details}>
         {() => (
            <Teleport to={`#${ROOT_APP_OUTLET}`} class='light-scheme'>
               <FloatingActionButton
                  class={[
                     { 'rotate-135 dark-scheme': transactionFlowIsOpen },
                     { '-translate-x-[60%]': amountFilled }
                  ]}
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
                  expandColor='var(--color-base)'
               >
                  {TransactionFlow}
               </ExpandingView>
            </Teleport>
         )}
      </NewTransactionDetailsScope.Provider>
   )
}
