import { TransactionListing } from '@/pages/app/home/(fragments)/transaction-listing'

export function RecentTransactions() {
   return (
      <div class='py-1 w-full'>
         <h4 class='text-center text-lg'>Recent Transactions</h4>
         <TransactionListing />
      </div>
   )
}
