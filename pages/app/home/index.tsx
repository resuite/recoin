import { ScrollView } from '@/components/views/scroll-view'
import { Header } from '@/pages/app/(fragments)/header'
import { Stage } from '@/pages/app/(fragments)/stage'
import { AddNewTransactionButton } from '@/pages/app/home/(fragments)/add-new-transaction-button'
import { Greeting } from '@/pages/app/home/(fragments)/greeting'
import { HomeStats } from '@/pages/app/home/(fragments)/home-stats'
import { RecentTransactionsHeader } from '@/pages/app/home/(fragments)/recent-transactions-header'
import { TransactionListing } from '@/pages/app/home/(fragments)/transaction-listing'

const Home = () => {
   return (
      <Stage class='grid grid-rows-[auto_1fr]'>
         <Header />
         <main class='max-h-0 min-h-full'>
            <ScrollView class='[body[data-has-expanded-content]_&]:overflow-y-hidden!'>
               {() => (
                  <>
                     <Greeting />
                     <HomeStats />
                     <RecentTransactionsHeader />
                     <TransactionListing />
                  </>
               )}
            </ScrollView>
         </main>
         <AddNewTransactionButton />
      </Stage>
   )
}

export default Home
