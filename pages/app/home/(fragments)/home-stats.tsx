import { MaskIcon } from '@/components/icons/icon-mask'
import ArrowBottomLeft from '@/components/icons/svg/arrow-bottom-left'
import ArrowTopRight from '@/components/icons/svg/arrow-top-right'
import { FitText } from '@/components/ui/fit-text'
import { FormattedMoney } from '@/components/ui/formatted-money'
import { useAuthContext } from '@/scopes/auth'
import { useWorkspaceBalance } from '@/utilities/composables/use-workspace-balance'

export const HomeStats = () => {
   const { currency } = useAuthContext()
   const { balance, totalIncome, totalExpense } = useWorkspaceBalance()

   const underlineClasses = [
      'after:content after:absolute after:left-0 after:bottom-0 after:w-full after:h-[3px] after:bg-canvas-text',
      'after:origin-left after:animate-lining after:[animation-delay:calc(var(--full-screen-transition-speed)*0.5)]'
   ]

   return (
      <div class='px-1 grid grid-cols-2 gap-x-1'>
         <div class={['relative text-center pt-0.75 py-0.25 col-span-2', ...underlineClasses]}>
            <h4 class='text-lg'>Current Balance</h4>
            <FitText scalingFactor={1.7} maxFontSize='var(--text-logo)' class='h-3.5'>
               <FormattedMoney currency={currency}>{balance}</FormattedMoney>
            </FitText>
         </div>

         {/* Income */}
         <div
            class={[
               'relative pt-0.75 py-0.25 grid grid-cols-[auto_auto] gap-x-0.25',
               ...underlineClasses
            ]}
         >
            <MaskIcon src={ArrowBottomLeft} class='h-0.75 w-0.75 justify-self-end bg-current' />
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
         <div
            class={[
               'relative pt-0.75 py-0.25 grid grid-rows-[auto_1fr] grid-cols-[auto_auto] gap-x-0.25',
               ...underlineClasses
            ]}
         >
            <MaskIcon src={ArrowTopRight} class='h-0.75 w-0.75 justify-self-end bg-current' />
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
