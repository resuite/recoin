import type { TransactionType } from '@/api/database/types'
import Add from '@/components/icons/svg/add'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { ExpandingView } from '@/components/views/expanding-view'
import { ROOT_APP_OUTLET_ID } from '@/constants'
import { QueryKeys } from '@/constants/query-keys'
import { VibrationPatterns } from '@/constants/vibration'
import TransactionModel from '@/database/models/transaction'
import TransactionFlow from '@/pages/app/transaction-flow'
import { useAuthContext } from '@/scopes/auth'
import { type TransactionDetailsForm, TransactionDetailsFormScope } from '@/scopes/forms'
import { useStore } from '@/scopes/livestore'
import { useRouteQueryControl } from '@/utilities/composables/use-route-query-control'
import { useWorkspaceId } from '@/utilities/composables/use-workspace-id'
import { createForm } from '@/utilities/form'
import { mergeDateAndTime, vibrate } from '@/utilities/miscellaneous'
import { Cell } from 'retend'
import { useRouteQuery } from 'retend/router'
import { Teleport } from 'retend/teleport'

export function AddNewTransactionButton() {
   const workspaceId = useWorkspaceId()
   const { currency: currencyRef } = useAuthContext()
   const store = useStore()
   const query = useRouteQuery()
   const {
      add: startNewTransactionFlow,
      hasKey: transactionFlowIsOpen,
      remove: closeNewTransactionFlow
   } = useRouteQueryControl(QueryKeys.TransactionFlow)
   const { hasKey: isOnSuccessPage } = useRouteQueryControl(QueryKeys.TransactionFlow.Success)

   const defaultValues = (): TransactionDetailsForm => ({
      amount: 0,
      label: '',
      date: new Date(),
      time: new Date().toTimeString().slice(0, 5),
      location: ''
   })

   const details = createForm(defaultValues, {
      onSubmit: (values) => {
         const id = crypto.randomUUID()
         const type = query.get(QueryKeys.TransactionFlow.Type).get() as TransactionType
         const categoryId = query.get(QueryKeys.TransactionFlow.Category).get()
         const currency = currencyRef.get()
         const { amount, label, location } = values
         const date = mergeDateAndTime(values.date, values.time)
         if (!categoryId || !type) {
            return
         }
         const newTransaction = {
            label,
            type,
            id,
            location: location || null,
            date,
            currency,
            workspaceId,
            amount,
            categoryId
         }
         const event = TransactionModel.events.transactionCreated(newTransaction)
         store.commit(event)
      }
   })

   const shouldDisplaceButton = Cell.derived(() => {
      return details.values.amount.get() > 0 && !isOnSuccessPage.get()
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
      <Teleport to={ROOT_APP_OUTLET_ID} class='light-scheme'>
         <FloatingActionButton
            class={[
               { 'rotate-135 dark-scheme': transactionFlowIsOpen },
               { '-translate-x-[60%]': shouldDisplaceButton },
               { 'scale-0': isOnSuccessPage }
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
            expandOrigin='calc(100dvh - var(--fab-size) - var(--spacing) * 3) auto auto  calc(50% - var(--fab-size) / 2)'
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
