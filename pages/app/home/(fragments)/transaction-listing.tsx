import { Cell, For, If } from 'retend'
import { FluidList } from 'retend-utils/components'
import { Sticky } from '@/components/ui/sticky'
import { TRANSACTION_ITEM_HEIGHT } from '@/constants'
import { TransactionItem } from '@/pages/app/home/(fragments)/transaction-item'
import TransactionItemBottomSheet from '@/pages/app/home/transaction-sheet'
import {
   type TransactionDateGroup,
   useGroupedTransactions
} from '@/utilities/composables/use-transactions'
import { getRelativeDateLabel } from '@/utilities/dates'

function TransactionGroup(group: TransactionDateGroup) {
   const { dateStoredValue, transactions } = group
   const date = new Date(dateStoredValue)

   return (
      <>
         <Sticky
            topOffset='var(--recent-transactions-header-height)'
            layer='transaction-listing-heading'
            class='sticky-header stuck:sticky-bg stuck:not-data-topmost:invisible'
         >
            <h5 class='text-xl px-1 first-of-type:pt-0.5 pt-1 py-0.5 isolate not-stuck:bg-canvas-background'>
               {getRelativeDateLabel(date)}
            </h5>
         </Sticky>
         <FluidList
            class='last-of-type:mb-5!'
            items={transactions}
            itemKey='id'
            itemHeight={TRANSACTION_ITEM_HEIGHT}
            itemWidth='100%'
            gap='5px'
            direction='block'
            speed='var(--speed-slow)'
            Template={TransactionItem}
         />
      </>
   )
}

export function TransactionListing() {
   const groups = useGroupedTransactions()
   const hasTransactions = Cell.derived(() => {
      return groups.get().length > 0
   })

   return If(hasTransactions, {
      true: () => (
         <>
            {For(groups, TransactionGroup, { key: 'dateStoredValue' })}
            <TransactionItemBottomSheet />
         </>
      ),
      false: () => (
         <div class='text-center pt-[15dvh] min-h-[50dvh] text-canvas-text/60'>
            No transactions yet.
         </div>
      )
   })
}
