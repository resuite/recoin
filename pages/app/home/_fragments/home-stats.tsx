import Arrows from '@/components/icons/svg/arrows'
import Loader from '@/components/icons/svg/loader'
import { ErrorMessage } from '@/components/ui/error-message'
import { FitText } from '@/components/ui/fit-text'
import { FormattedMoney } from '@/components/ui/formatted-money'
import { defaultCurrency, getHomeStats } from '@/data'
import { usePromise } from '@/utilities/composables'
import { Switch } from 'retend'

interface HomeStatsContentProps {
   startingBalance: number
   totalExpense: number
   totalIncome: number
}

const HomeStatsContent = (props: HomeStatsContentProps) => {
   const { startingBalance, totalExpense, totalIncome } = props
   return (
      <>
         <div class='text-center animate-fade-in [--starting-translate:0] py-0.75 border-b-3 w-full'>
            <h4 class='text-lg'>Current Balance</h4>
            <FitText scalingFactor={1.7} maxFontSize='var(--text-logo)' class='h-3.5'>
               <FormattedMoney currency={defaultCurrency.value}>
                  {startingBalance + totalIncome - totalExpense}
               </FormattedMoney>
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
                  <FormattedMoney currency={defaultCurrency.value}>{totalIncome}</FormattedMoney>
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
                  <FormattedMoney currency={defaultCurrency.value}>{totalExpense}</FormattedMoney>
               </FitText>
            </div>
         </div>
      </>
   )
}

export const HomeStats = () => {
   const homeStats = usePromise(getHomeStats)

   return (
      <div>
         {Switch.OnProperty(homeStats, 'state', {
            error: ({ error }) => <ErrorMessage error={error} />,
            pending: () => (
               <div class='grid place-items-center place-content-center'>
                  <Loader class='[grid-area:1/1] h-1 opacity-50' />
                  <div class='[grid-area:1/1] invisible'>
                     {/*Forces the loader to occupy the same width as the data.*/}
                     <HomeStatsContent startingBalance={0} totalExpense={0} totalIncome={0} />
                  </div>
               </div>
            ),
            complete: ({ data: stats }) => <HomeStatsContent {...stats} />
         })}
      </div>
   )
}
