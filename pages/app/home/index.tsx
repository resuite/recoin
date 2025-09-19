import Arrows from '@/components/icons/svg/arrows'
import { FormattedMoney } from '@/components/ui/formatted-money'
import { QueryKeys } from '@/constants/query-keys'
import { defaultCurrency } from '@/data'
import { Header } from '@/pages/app/$fragments/header'
import { AddNewTransactionButton } from '@/pages/app/home/$fragments/add-new-transaction-button'
import { useAuthContext } from '@/scopes/auth'
import { useRouteQueryControl } from '@/utilities/composables'
import { Cell } from 'retend'

const Home = () => {
   const { userData } = useAuthContext()
   const { hasKey: transactionFlowIsOpen } = useRouteQueryControl(QueryKeys.TransactionFlow)

   const currentBalance = Cell.derived(() => {
      return 0.0
   })

   return (
      <div
         class={[
            'grid grid-rows-[auto_1fr] translate-0 h-full w-full light-scheme rounded-t-3xl',
            'duration-slow transition-transform ease',
            { 'translate-y-3 scale-90': transactionFlowIsOpen }
         ]}
      >
         <Header />
         <main class='grid grid-rows-[repeat(3,auto)_1fr] px-1 grid-cols-1 justify-center'>
            {/* Greeting */}
            <div class='text-center w-full'>
               <h3 class='text-header'>Hello, {userData.get()?.firstName}.</h3>
               <p class='text-sm opacity-60'>Add a new transaction to get started.</p>
            </div>

            {/* Current Balance */}
            <div class='text-center py-1 border-b-3 w-full'>
               <h4 class='text-lg'>Current Balance</h4>
               <FormattedMoney
                  class='text-logo'
                  value={currentBalance}
                  currency={defaultCurrency}
               />
            </div>

            {/* Income and Expense */}
            <div class='text-center w-full h-fit grid grid-cols-2 gap-1'>
               <div class='border-b-3 py-1 grid grid-cols-[auto_auto] gap-x-0.25'>
                  <Arrows class='h-0.75 justify-self-end' />
                  <h4 class='text-sm justify-self-start'>Income</h4>
                  <FormattedMoney
                     class='text-4xl col-span-2 '
                     value={currentBalance}
                     currency={defaultCurrency}
                  />
               </div>
               <div class='border-b-3 py-1 grid grid-cols-[auto_auto] gap-x-0.25'>
                  <Arrows class='h-0.75 justify-self-end' direction='top-right' />
                  <h4 class='text-sm justify-self-start'>Expense</h4>
                  <FormattedMoney
                     class='text-4xl col-span-2'
                     value={currentBalance}
                     currency={defaultCurrency}
                  />
               </div>
            </div>

            {/* Recent Transactions */}
            <div class='py-1 '>
               <h4 class='text-center text-lg'>Recent Transactions</h4>
            </div>
         </main>
         <AddNewTransactionButton />
      </div>
   )
}

export default Home
