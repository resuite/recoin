import Bin from '@/components/icons/svg/bin'
import Pencil from '@/components/icons/svg/pencil'
import { Button } from '@/components/ui/button'
import { InfoList, InfoListItem } from '@/components/ui/info-list'
import { QueryKeys } from '@/constants/query-keys'
import type { Category } from '@/database/models/category'
import type { Transaction } from '@/database/models/transaction'
import { TransactionSheetHeader } from '@/pages/app/home/transaction-sheet/(fragments)/transaction-sheet-header'
import { useRouteQueryControl } from '@/utilities/composables/use-route-query-control'

interface TransactionViewModeProps {
   transaction: Transaction
   category: Category
}

const TransactionViewMode = (props: TransactionViewModeProps) => {
   const { transaction, category } = props
   const { add: openEditMode } = useRouteQueryControl(QueryKeys.TransactionSheet.IsInEditMode)
   const date = transaction.date.toLocaleDateString('en-GB', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
   })
   const time = transaction.date.toLocaleTimeString('en-GB', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
   })

   return (
      <>
         <div
            class={[
               'w-full',
               // Only animate info list if header is animating
               'has-data-unique-element-transition:[&_dl]:animate-fade-in'
            ]}
         >
            <TransactionSheetHeader transaction={transaction} category={category} />
            <InfoList
               class={[
                  'col-span-2 mb-1.25',
                  '[--starting-translate:0_-60%] [--starting-opacity:0]'
               ]}
               style={{
                  animationTimingFunction: 'ease',
                  animationDuration: 'var(--sheet-sizing-speed)'
               }}
            >
               <InfoListItem label='Label' value={transaction.label} />
               <InfoListItem label='Date' value={date} />
               <InfoListItem label='Time' value={time} />
               <InfoListItem label='Location' value={transaction.location || 'Not Provided'} />
            </InfoList>
         </div>
         <div class='w-full gap-1 grid grid-cols-2'>
            <Button class='w-full btn-outline'>
               <Bin class='btn-icon' />
               Delete
            </Button>
            <Button class='w-full border-canvas-text' onClick={openEditMode}>
               <Pencil class='btn-icon' />
               Edit
            </Button>
         </div>
      </>
   )
}

export default TransactionViewMode
