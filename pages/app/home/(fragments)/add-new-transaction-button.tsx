import { Cell } from 'retend'
import { useRouteQuery } from 'retend/router'
import type { TransactionType } from '@/api/database/types'
import { ExpandingView } from '@/components/expanding-view'
import { FloatingMenu, type FloatingMenuItem } from '@/components/floating-action-menu'
import Add from '@/components/icons/svg/add'
import { useSidebarContext } from '@/components/sidebar-provider-view'
import { ROOT_APP_OUTLET_ID } from '@/constants'
import { QueryKeys } from '@/constants/query-keys'
import { VibrationPatterns } from '@/constants/vibration'
import TransactionModel from '@/database/models/transaction'
import TransactionFlow from '@/pages/app/transaction-flow'
import { useAuthContext } from '@/scopes/auth'
import { type TransactionDetailsForm, TransactionDetailsFormScope } from '@/scopes/forms'
import { useStore } from '@/scopes/livestore'
import { ThemeProvider } from '@/scopes/theme'
import { useRouteQueryControl } from '@/utilities/composables/use-route-query-control'
import { useWorkspaceId } from '@/utilities/composables/use-workspace-id'
import { createForm } from '@/utilities/form'
import { mergeDateAndTime, vibrate } from '@/utilities/miscellaneous'

export function AddNewTransactionButton() {
   const workspaceId = useWorkspaceId()
   const { currency: currencyRef } = useAuthContext()
   const sidebarCtx = useSidebarContext()
   const store = useStore()
   const query = useRouteQuery()
   const {
      add: startNewTransactionFlow,
      hasKey: transactionFlowIsOpen,
      remove: closeNewTransactionFlow
   } = useRouteQueryControl(QueryKeys.TransactionFlow)
   const type = query.get(QueryKeys.TransactionFlow.Type)
   const typeChosen = Cell.derived(() => {
      return type.get() !== null
   })
   const floatingButtonMenuOpen = Cell.derived(() => {
      return transactionFlowIsOpen.get() && !typeChosen.get()
   })

   const items: Array<FloatingMenuItem> = [
      {
         label: 'Expense',
         icon: 'arrow-top-right',
         onClick() {
            query.set(QueryKeys.TransactionFlow.Type, 'expense')
         }
      },
      {
         label: 'Income',
         icon: 'arrow-bottom-left',
         onClick() {
            query.set(QueryKeys.TransactionFlow.Type, 'income')
         }
      }
   ]

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

   const toggleState = () => {
      vibrate(VibrationPatterns.ButtonPress)
      if (transactionFlowIsOpen.get()) {
         sidebarCtx.toggleSidebarEnabled(true)
         closeNewTransactionFlow()
      } else {
         sidebarCtx.toggleSidebarEnabled(false)
         startNewTransactionFlow()
      }
   }

   const FloatingIcon = () => {
      return (
         <div
            class={[
               'w-1/2 h-1/2 duration-slow transition-transform bouncy',
               { 'rotate-45': transactionFlowIsOpen }
            ]}
         >
            <Add />
         </div>
      )
   }

   return (
      <FloatingMenu
         teleportTarget={ROOT_APP_OUTLET_ID}
         isOpen={floatingButtonMenuOpen}
         onStateChange={toggleState}
         items={items}
         icon={FloatingIcon}
      >
         <ThemeProvider scheme='dark'>
            {() => (
               <ExpandingView isOpen={typeChosen} expandColor='var(--color-base)'>
                  {() => (
                     <TransactionDetailsFormScope.Provider value={details}>
                        {TransactionFlow}
                     </TransactionDetailsFormScope.Provider>
                  )}
               </ExpandingView>
            )}
         </ThemeProvider>
      </FloatingMenu>
   )
}
