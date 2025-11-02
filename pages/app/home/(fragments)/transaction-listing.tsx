import { QueryControlledBottomSheet } from '@/components/views/bottom-sheet-view'
import { QueryKeys } from '@/constants/query-keys'
import { TransactionItem } from '@/pages/app/home/(fragments)/transaction-item'
import { TransactionItemBottomSheet } from '@/pages/app/home/(fragments)/transaction-item-bottom-sheet'

import { useTransactions } from '@/utilities/composables/use-transactions'
import { FluidList } from 'retend-utils/components'

export function TransactionListing() {
   const transactions = useTransactions()

   return (
      <div class='pb-3 w-full h-full'>
         <QueryControlledBottomSheet
            class='light-scheme'
            queryKey={QueryKeys.RecentTransactions.OpenItemId}
         >
            {() => <TransactionItemBottomSheet />}
         </QueryControlledBottomSheet>
         <FluidList
            items={transactions}
            itemKey='id'
            itemHeight='70px'
            itemWidth='100%'
            gap='5px'
            direction='block'
            Template={TransactionItem}
         />
      </div>
   )
}
