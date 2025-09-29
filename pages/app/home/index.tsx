import { QueryKeys } from '@/constants/query-keys'
import { Header } from '@/pages/app/_fragments/header'
import { AddNewTransactionButton } from '@/pages/app/home/_fragments/add-new-transaction-button'
import { HomeStats } from '@/pages/app/home/_fragments/home-stats'
import { RecentTransactions } from '@/pages/app/home/_fragments/recent-transactions'
import { useAuthContext } from '@/scopes/auth'
import { useRouteQueryControl } from '@/utilities/composables/use-route-query-control'

const HomeGreeting = () => {
   const { userData } = useAuthContext()
   return (
      <div class='text-center w-full'>
         <h3 class='text-header'>Hello, {userData.get()?.firstName}.</h3>
         <p class='text-sm opacity-60'>Add a new transaction to get started.</p>
      </div>
   )
}

const Home = () => {
   const { hasKey: transactionFlowIsOpen } = useRouteQueryControl(QueryKeys.TransactionFlow)
   return (
      <div
         class={[
            'grid grid-rows-[auto_1fr] translate-0 h-full light-scheme rounded-t-3xl',
            'duration-bit-slower transition-transform ease',
            { 'translate-y-3 scale-90': transactionFlowIsOpen }
         ]}
      >
         <Header />
         <main class='grid grid-rows-[auto_auto_1fr] px-1 grid-cols-1 justify-center'>
            <HomeGreeting />
            <HomeStats />
            <RecentTransactions />
         </main>
         <AddNewTransactionButton />
      </div>
   )
}

export default Home
