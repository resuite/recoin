import Arrows from '@/components/icons/svg/arrows'
import { FitText } from '@/components/ui/fit-text'
import { FormattedMoney } from '@/components/ui/formatted-money'
import { useAuthContext } from '@/scopes/auth'
import { useWorkspaceBalance } from '@/utilities/composables/use-workspace-balance'

export const HomeStats = () => {
   const { currency } = useAuthContext()
   const { balance, totalIncome, totalExpense } = useWorkspaceBalance()

   return (
      <div class='animate-fade grid grid-cols-2 gap-x-1'>
         <div class='text-center py-0.75 border-b-3 col-span-2'>
            <h4 class='text-lg'>Current Balance</h4>
            <FitText scalingFactor={1.7} maxFontSize='var(--text-logo)' class='h-3.5'>
               <FormattedMoney currency={currency}>{balance}</FormattedMoney>
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
               <FormattedMoney currency={currency}>{totalIncome}</FormattedMoney>
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
               <FormattedMoney currency={currency}>{totalExpense}</FormattedMoney>
            </FitText>
         </div>
      </div>
   )
}
