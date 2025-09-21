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
      <div class='animate-fade grid grid-cols-2 gap-x-1'>
         <div class='text-center py-0.75 border-b-3 col-span-2'>
            <h4 class='text-lg'>Current Balance</h4>
            <FitText scalingFactor={1.7} maxFontSize='var(--text-logo)' class='h-3.5'>
               <FormattedMoney currency={defaultCurrency.value}>
                  {startingBalance + totalIncome - totalExpense}
               </FormattedMoney>
            </FitText>
         </div>

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
   )
}

export const HomeStats = () => {
   const homeStats = usePromise(getHomeStats)
   const heightValues = [
      // current balance.
      'var(--spacing) * 0.75 * 2',
      'var(--text-lg)',
      'max(var(--spacing) * 3.5, var(--text-logo))',
      '3px',
      // income/expense
      'var(--spacing) * 0.75 * 2',
      'max(var(--spacing) * 0.75, var(--text-sm))',
      '6.98dvh',
      '3px',
      // line heights
      '0.625rem + 0.078125rem'
   ]
   const height = `calc(${heightValues.map((cssString) => `(${cssString})`).join(' + ')})`

   return Switch.OnProperty(homeStats, 'state', {
      error: ({ error }) => (
         <div style={{ height }} class='grid place-items-center place-content-center'>
            <ErrorMessage error={error} />
         </div>
      ),
      pending: () => (
         <div style={{ height }} class='grid place-items-center place-content-center'>
            <Loader class='[grid-area:1/1] h-1 opacity-50' />
         </div>
      ),
      complete: ({ data: stats }) => <HomeStatsContent {...stats} />
   })
}
