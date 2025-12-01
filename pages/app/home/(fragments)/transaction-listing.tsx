import { TRANSACTION_ITEM_HEIGHT } from '@/constants'
import { TransactionItem } from '@/pages/app/home/(fragments)/transaction-item'
import TransactionItemBottomSheet from '@/pages/app/home/transaction-sheet'
import {
   type TransactionDateGroup,
   useGroupedTransactions
} from '@/utilities/composables/use-transactions'
import { getRelativeDateLabel } from '@/utilities/dates'
import { For } from 'retend'
import { FluidList } from 'retend-utils/components'

function TransactionGroup(group: TransactionDateGroup) {
   const { dateStoredValue, transactions } = group
   const date = new Date(dateStoredValue)

   return (
      <>
         <h5 class='sticky top-0 text-xl px-1 first-of-type:pt-0.5 pt-1 py-0.5 font-bold'>
            {getRelativeDateLabel(date)}
         </h5>
         <FluidList
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

   return (
      <>
         {For(groups, TransactionGroup, { key: 'dateStoredValue' })}
         <TransactionItemBottomSheet />
      </>
   )
}
