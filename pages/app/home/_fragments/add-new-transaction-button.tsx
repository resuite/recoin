import Add from '@/components/icons/svg/add'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { ExpandingView } from '@/components/views'
import { ROOT_APP_OUTLET } from '@/constants'
import { QueryKeys } from '@/constants/query-keys'
import { VibrationPatterns } from '@/constants/vibration'
import TransactionFlow from '@/pages/app/transaction-flow'
import { type TransactionDetailsForm, TransactionDetailsFormScope } from '@/scopes/forms'
import { useRouteQueryControl } from '@/utilities/composables'
import { createForm } from '@/utilities/form'
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
   const rootOutlet = `#${ROOT_APP_OUTLET}`

   const details = createForm<TransactionDetailsForm>({
      amount: 0,
      label: '',
      date: new Date(),
      time: new Date().toTimeString().slice(0, 5),
      location: ''
   })

   const amountFilled = Cell.derived(() => {
      return details.values.amount.get() > 0 && isOnTransactionDetailsPage.get()
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
      <Teleport to={rootOutlet} class='light-scheme'>
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
            {() => (
               <TransactionDetailsFormScope.Provider value={details}>
                  {TransactionFlow}
               </TransactionDetailsFormScope.Provider>
            )}
         </ExpandingView>
      </Teleport>
   )
}
