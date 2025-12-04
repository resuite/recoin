import { type Cell, useSetupEffect } from 'retend'
import Add from '@/components/icons/svg/add'
import Checkmark from '@/components/icons/svg/checkmark'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { useBottomSheetContext } from '@/components/views/bottom-sheet-view'
import { SHEET_SIZING_ANIMATION_STYLES, TOAST_DEFAULT_DURATION } from '@/constants'
import { QueryKeys } from '@/constants/query-keys'
import type { Category } from '@/database/models/category'
import type { Transaction } from '@/database/models/transaction'
import TransactionModel from '@/database/models/transaction'
import { ToastMessage } from '@/pages/app/(fragments)/toast-message'
import { TransactionSheetHeader } from '@/pages/app/home/transaction-sheet/(fragments)/transaction-sheet-header'
import { useStore } from '@/scopes/livestore'
import { animationsSettled } from '@/utilities/animations'
import { useRouteQueryControl } from '@/utilities/composables/use-route-query-control'
import { defer } from '@/utilities/miscellaneous'

interface TransactionDeleteModeProps {
   transaction: Cell<Transaction>
   category: Category
   onLoad: () => void
}

const TransactionDeleteMode = (props: TransactionDeleteModeProps) => {
   const { transaction, category, onLoad } = props
   const transactionId = transaction.get().id
   const store = useStore()
   const { showToast } = useToast()
   const { contentRef } = useBottomSheetContext()
   const { remove: closeSheet } = useRouteQueryControl(QueryKeys.TransactionSheet)
   const { remove: closeDeleteMode } = useRouteQueryControl(
      QueryKeys.TransactionSheet.Mode,
      'Delete'
   )

   const handleDelete = async () => {
      closeSheet()
      showToast({
         content: <ToastMessage Icon={Checkmark} message='Transaction deleted.' />,
         duration: TOAST_DEFAULT_DURATION
      })
      await animationsSettled(contentRef)
      defer(() => {
         store.commit(TransactionModel.events.transactionDeleted({ id: transactionId }))
      })
   }

   useSetupEffect(onLoad)

   return (
      <div class='w-full grid gap-y-0.5'>
         <TransactionSheetHeader transaction={transaction} category={category} />
         <div
            class='w-full text-center animate-fade-in [--starting-translate:0_-70px]'
            style={SHEET_SIZING_ANIMATION_STYLES}
         >
            Are you sure you want to delete this transaction? <b>This action cannot be undone.</b>
         </div>
         <div class='w-full gap-1 mt-1 grid grid-cols-2'>
            <Button class='w-full btn-outline' onClick={() => closeDeleteMode()}>
               <Add class='btn-icon rotate-45' />
               Cancel
            </Button>
            <Button class='w-full  bg-red-800 border-red-800' onClick={handleDelete}>
               <Checkmark class='btn-icon' />
               Delete
            </Button>
         </div>
      </div>
   )
}

export default TransactionDeleteMode
