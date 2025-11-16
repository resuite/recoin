import Bin from '@/components/icons/svg/bin'
import Pencil from '@/components/icons/svg/pencil'
import { Button } from '@/components/ui/button'
import { InfoList, InfoListItem } from '@/components/ui/info-list'
import { QueryKeys } from '@/constants/query-keys'
import type { Category } from '@/database/models/category'
import type { Transaction } from '@/database/models/transaction'
import { TransactionSheetHeader } from '@/pages/app/home/transaction-sheet/(fragments)/transaction-sheet-header'
import { useRouteQueryControl } from '@/utilities/composables/use-route-query-control'
import { createPointerOrClickHandler } from '@/utilities/miscellaneous'
import { Cell } from 'retend'

interface TransactionViewModeProps {
   transaction: Cell<Transaction>
   category: Category
   editModeLoadedPrior: Cell<boolean>
}

const TransactionViewMode = (props: TransactionViewModeProps) => {
   const { transaction, category, editModeLoadedPrior } = props
   const { add: navigateToEditMode } = useRouteQueryControl(QueryKeys.TransactionSheet.IsInEditMode)
   const label = Cell.derived(() => {
      return transaction.get().label
   })
   const date = Cell.derived(() => {
      return transaction.get().date.toLocaleDateString('en-GB', {
         month: 'long',
         day: 'numeric',
         year: 'numeric'
      })
   })
   const time = Cell.derived(() => {
      return transaction.get().date.toLocaleTimeString('en-GB', {
         hour: 'numeric',
         minute: 'numeric',
         hour12: true
      })
   })
   const location = Cell.derived(() => {
      return transaction.get().location || 'Not Provided'
   })

   const handleEditClick = createPointerOrClickHandler(() => {
      navigateToEditMode()
   })

   return (
      <>
         <div
            class={[
               'w-full',
               '[--starting-translate:0_-70%] [--starting-opacity:0]',
               { 'animate-fade-in': editModeLoadedPrior }
            ]}
            style={{
               animationTimingFunction: 'ease',
               animationDuration: 'var(--sheet-sizing-speed)'
            }}
         >
            <TransactionSheetHeader transaction={transaction} category={category} />
            <InfoList class='col-span-2 mb-1.25'>
               <InfoListItem label='Label' value={label} />
               <InfoListItem label='Date' value={date} />
               <InfoListItem label='Time' value={time} />
               <InfoListItem label='Location' value={location} />
            </InfoList>
         </div>
         <div class='w-full gap-1 grid grid-cols-2'>
            <Button class='w-full btn-outline'>
               <Bin class='btn-icon' />
               Delete
            </Button>
            <Button
               class='w-full border-canvas-text'
               onClick={handleEditClick}
               onPointerUp={handleEditClick}
            >
               <Pencil class='btn-icon' />
               Edit
            </Button>
         </div>
      </>
   )
}

export default TransactionViewMode
