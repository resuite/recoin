import { TRANSACTION_ITEM_HEIGHT } from '@/constants'
import { TransactionItem } from '@/pages/app/home/(fragments)/transaction-item'
import TransactionItemBottomSheet from '@/pages/app/home/transaction-sheet'
import { useTransactions } from '@/utilities/composables/use-transactions'
import { FluidList } from 'retend-utils/components'

export function TransactionListing() {
   const transactions = useTransactions()

   return (
      <div class='mb-3 w-full h-full'>
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
         <TransactionItemBottomSheet />
      </div>
   )
}
