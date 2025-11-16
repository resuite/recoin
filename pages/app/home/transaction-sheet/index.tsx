import { QueryControlledBottomSheet } from '@/components/views/bottom-sheet-view'
import { SafeAreaView } from '@/components/views/safe-area-view'
import { QueryKeys } from '@/constants/query-keys'
import type { Transaction } from '@/database/models/transaction'
import TransactionEditMode from '@/pages/app/home/transaction-sheet/transaction-edit-mode'
import TransactionViewMode from '@/pages/app/home/transaction-sheet/transaction-view-mode'
import { useCategory } from '@/utilities/composables/use-categories'
import { useRouteQueryControl } from '@/utilities/composables/use-route-query-control'
import { useTransaction } from '@/utilities/composables/use-transactions'
import { Cell, Switch, useSetupEffect } from 'retend'
import { useRouteQuery } from 'retend/router'

const TransactionItemBottomSheetContent = () => {
   const query = useRouteQuery()
   const transactionId = query.get(QueryKeys.TransactionSheet.OpenItemId).get()
   const editModeLoaded = Cell.source(false)
   const { remove: cleanUpBottomSheetKeys } = useRouteQueryControl(QueryKeys.TransactionSheet)
   const { hasKey: isInEditMode } = useRouteQueryControl(QueryKeys.TransactionSheet.IsInEditMode)
   const mode = Cell.derived(() => {
      if (isInEditMode.get()) {
         return 'edit'
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

   const handleEditModeLoad = () => {
      editModeLoaded.set(true)
   }

   useSetupEffect(() => {
      return cleanUpBottomSheetKeys
   })

   return (
      <SafeAreaView class='grid justify-center place-items-center gap-y-0.25 grid-cols-1 h-full w-full'>
         {Switch(mode, {
            details: () => (
               <TransactionViewMode
                  editModeLoadedPrior={editModeLoaded}
                  transaction={transaction}
                  category={category}
               />
            ),
            edit: () => (
               <TransactionEditMode transaction={transaction} onLoad={handleEditModeLoad} />
            )
         })}
      </SafeAreaView>
   )
}

const TransactionItemBottomSheet = () => {
   return (
      <QueryControlledBottomSheet
         class='light-scheme bg-transparent'
         queryKey={QueryKeys.TransactionSheet.OpenItemId}
         dynamicSizing
      >
         {() => <TransactionItemBottomSheetContent />}
      </QueryControlledBottomSheet>
   )
}

export default TransactionItemBottomSheet
