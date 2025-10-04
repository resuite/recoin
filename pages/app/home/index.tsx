import { Button } from '@/components/ui/button'
import { FadeScrollView } from '@/components/views/fade-scroll-view'
import { useVerticalPanContext } from '@/components/views/vertical-pan-view'
import type { Achievement } from '@/database/models/achievement'
import { Header } from '@/pages/app/(fragments)/header'
import { Stage } from '@/pages/app/(fragments)/stage'
import { AddNewTransactionButton } from '@/pages/app/home/(fragments)/add-new-transaction-button'
import { HomeStats } from '@/pages/app/home/(fragments)/home-stats'
import { RecentTransactions } from '@/pages/app/home/(fragments)/recent-transactions'
import NewCoin from '@/pages/app/new-coin'
import { useAuthContext } from '@/scopes/auth'

const Home = () => {
   const { userData } = useAuthContext()
   const firstName = userData.get()?.firstName
   const { open } = useVerticalPanContext()

   const handleClick = () => {
      const activatedCoin: Achievement = {
         id: 'test-achievement',
         workspaceId: 'test-workspace',
         name: 'activated.',
         icon: 'atom',
         message: 'You earned this coin by making your first transaction. Well done and welcome!'
      }

      open(() => <NewCoin coin={activatedCoin} />)
   }

   return (
      <Stage class='grid grid-rows-[auto_1fr]'>
         <Header />
         <main class='px-1 overflow-y-auto max-h-0 min-h-full'>
            <FadeScrollView>
               <div class='text-center w-full'>
                  <h3 class='text-header'>Hello, {firstName}.</h3>
                  <p class='text-sm opacity-60'>Add a new transaction to get started.</p>
               </div>
               <HomeStats />
               <RecentTransactions />
            </FadeScrollView>
            <div class='w-full pb-3'>
               <Button class='btn-outline min-w-4' onClick={handleClick}>
                  Test Pan View
               </Button>
            </div>
         </main>
         <AddNewTransactionButton />
      </Stage>
   )
}

export default Home
