import { ScrollTimelineView } from '@/components/views/scroll-timeline-view'
import { Header } from '@/pages/app/(fragments)/header'
import { Stage } from '@/pages/app/(fragments)/stage'
import { AddNewTransactionButton } from '@/pages/app/home/(fragments)/add-new-transaction-button'
import { HomeStats } from '@/pages/app/home/(fragments)/home-stats'
import { RecentTransactionsHeader } from '@/pages/app/home/(fragments)/recent-transactions-header'
import { TransactionListing } from '@/pages/app/home/(fragments)/transaction-listing'
import { useAuthContext } from '@/scopes/auth'

const Home = () => {
   const { userData } = useAuthContext()
   const firstName = userData.get()?.firstName

   const Greeting = () => {
      return (
         <div class='px-1 text-center'>
            <h3 class='text-header'>Hello, {firstName}.</h3>
            <p class='text-sm opacity-60'>Add a new transaction to get started.</p>
         </div>
      )
   }

   return (
      <Stage class='grid grid-rows-[auto_1fr]'>
         <Header />
         <main class='max-h-0 min-h-full'>
            <ScrollTimelineView axis='block'>
               {() => (
                  <>
                     <Greeting />
                     <HomeStats />
                     <RecentTransactionsHeader />
                     <TransactionListing />
                  </>
               )}
            </ScrollTimelineView>
         </main>
         <AddNewTransactionButton />
      </Stage>
   )
}

export default Home
