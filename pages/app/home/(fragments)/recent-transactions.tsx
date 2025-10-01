import { TransactionListing } from '@/pages/app/home/(fragments)/transaction-listing'

export function RecentTransactions() {
   return (
      <div class='py-1 w-full grid grid-rows-[auto_1fr] grid-cols-1'>
         <h4 class='text-center text-lg'>Recent Transactions</h4>
         <TransactionListing />
      </div>
   )
}
