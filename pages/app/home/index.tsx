import Arrows from '@/components/icons/svg/arrows'
import { FitText } from '@/components/ui/fit-text'
import { FormattedMoney } from '@/components/ui/formatted-money'
import { QueryKeys } from '@/constants/query-keys'
import { currentBalance, defaultCurrency, derivedExpense, derivedIncome } from '@/data'
import { Header } from '@/pages/app/_fragments/header'
import { AddNewTransactionButton } from '@/pages/app/home/_fragments/add-new-transaction-button'
import { useAuthContext } from '@/scopes/auth'
import { useRouteQueryControl } from '@/utilities/composables'

const Home = () => {
   const { userData } = useAuthContext()
   const { hasKey: transactionFlowIsOpen } = useRouteQueryControl(QueryKeys.TransactionFlow)

   return (
      <div
         class={[
            'grid grid-rows-[auto_1fr] translate-0 h-full w-full light-scheme rounded-t-3xl',
            'duration-bit-slower transition-transform ease',
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
            <div class='text-center py-0.75 border-b-3 w-full'>
               <h4 class='text-lg'>Current Balance</h4>
               <FitText scalingFactor={1.7} maxFontSize='var(--text-logo)' class='h-3.5'>
                  <FormattedMoney currency={defaultCurrency.value}>{currentBalance}</FormattedMoney>
               </FitText>
            </div>

            <div class='text-center w-full h-fit grid grid-cols-2 gap-1'>
               {/* Income */}
               <div class='border-b-3 py-0.75 grid grid-cols-[auto_auto] gap-x-0.25'>
                  <Arrows class='h-0.75 justify-self-end' />
                  <h4 class='text-sm justify-self-start'>Income</h4>
                  <FitText
                     scalingFactor={1.5}
                     maxFontSize='var(--text-4xl)'
                     class='col-span-2 min-h-[6.98dvh]'
                  >
                     <FormattedMoney currency={defaultCurrency.value}>
                        {derivedIncome}
                     </FormattedMoney>
                  </FitText>
               </div>

               {/* Expense */}
               <div class='border-b-3 py-0.75 grid grid-rows-[auto_1fr] grid-cols-[auto_auto] gap-x-0.25'>
                  <Arrows class='h-0.75 justify-self-end' direction='top-right' />
                  <h4 class='text-sm justify-self-start'>Expense</h4>
                  <FitText
                     scalingFactor={1.5}
                     maxFontSize='var(--text-4xl)'
                     class='col-span-2 min-h-[6.98dvh]'
                  >
                     <FormattedMoney currency={defaultCurrency.value}>
                        {derivedExpense}
                     </FormattedMoney>
                  </FitText>
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
