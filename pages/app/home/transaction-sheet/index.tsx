import { Cell, Switch, useSetupEffect } from 'retend'
import { useRouteQuery } from 'retend/router'
import { QueryControlledBottomSheet } from '@/components/bottom-sheet-view'
import { SafeAreaView } from '@/components/safe-area-view'
import { ToastProvider } from '@/components/toast'
import { QueryKeys } from '@/constants/query-keys'
import type { Transaction } from '@/database/models/transaction'
import TransactionDeleteMode from '@/pages/app/home/transaction-sheet/transaction-delete-mode'
import TransactionEditMode from '@/pages/app/home/transaction-sheet/transaction-edit-mode'
import TransactionViewMode from '@/pages/app/home/transaction-sheet/transaction-view-mode'
import { useCategory } from '@/utilities/composables/use-categories'
import { useRouteQueryControl } from '@/utilities/composables/use-route-query-control'
import { useTransaction } from '@/utilities/composables/use-transactions'

const TransactionItemBottomSheetContent = () => {
   const query = useRouteQuery()
   const transactionId = query.get(QueryKeys.TransactionSheet.OpenItemId).get()
   const lastLoadedMode = Cell.source<'delete' | 'edit' | null>(null)
   const animateDirection = Cell.derived(() => {
      if (lastLoadedMode.get() === 'edit') {
         return 'down'
      }
      if (lastLoadedMode.get() === 'delete') {
         return 'up'
      }
      return null
   })

   const { remove: cleanUpBottomSheetKeys } = useRouteQueryControl(QueryKeys.TransactionSheet)
   const { hasKey: isInEditMode } = useRouteQueryControl(QueryKeys.TransactionSheet.Mode, 'Edit')
   const { hasKey: isInDeleteMode } = useRouteQueryControl(
      QueryKeys.TransactionSheet.Mode,
      'Delete'
   )

   const mode = Cell.derived(() => {
      if (isInEditMode.get()) {
         return 'edit'
      }
      if (isInDeleteMode.get()) {
         return 'delete'
      }
      return 'details'
   })
   if (!transactionId) {
      return null
   }
   const transaction = useTransaction(transactionId) as Cell<Transaction>
   const transactionData = transaction.get()
   if (transactionData === null) {
      return null
   }

   const category = useCategory(transactionData.categoryId).get()
   if (!category) {
      return null
   }

   const handleEditLoad = () => {
      lastLoadedMode.set('edit')
   }

   const handleDeleteLoad = () => {
      lastLoadedMode.set('delete')
   }

   useSetupEffect(() => {
      return cleanUpBottomSheetKeys
   })

   return (
      <SafeAreaView
         class='grid justify-center place-items-center gap-y-0.25 grid-cols-1 h-full w-full'
         containerClass='pt-1!'
      >
         {Switch(mode, {
            details: () => (
               <TransactionViewMode
                  animateDirection={animateDirection}
                  transaction={transaction}
                  category={category}
               />
            ),
            edit: () => <TransactionEditMode transaction={transaction} onLoad={handleEditLoad} />,
            delete: () => (
               <TransactionDeleteMode
                  transaction={transaction}
                  category={category}
                  onLoad={handleDeleteLoad}
               />
            )
         })}
      </SafeAreaView>
   )
}

const TransactionItemBottomSheet = () => {
   return (
      <ToastProvider>
         {() => (
            <QueryControlledBottomSheet
               queryKey={QueryKeys.TransactionSheet.OpenItemId}
               dynamicSizing
            >
               {() => <TransactionItemBottomSheetContent />}
            </QueryControlledBottomSheet>
         )}
      </ToastProvider>
   )
}

export default TransactionItemBottomSheet
