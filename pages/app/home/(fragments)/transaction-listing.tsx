import { TransactionItem } from '@/pages/app/home/(fragments)/transaction-item'
import { useTransactions } from '@/utilities/composables/use-transactions'
import { FluidList } from 'retend-utils/components'

export function TransactionListing() {
   const transactions = useTransactions()

   return (
      <FluidList
         items={transactions}
         itemKey='id'
         itemHeight='70px'
         itemWidth='100%'
         gap='5px'
         direction='block'
         Template={TransactionItem}
      />
   )
}
