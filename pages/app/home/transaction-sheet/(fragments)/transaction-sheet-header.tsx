import Arrows from '@/components/icons/svg/arrows'
import { FitText } from '@/components/ui/fit-text'
import { FormattedMoney } from '@/components/ui/formatted-money'
import type { Category } from '@/database/models/category'
import type { Transaction } from '@/database/models/transaction'
import { CategoryIcon } from '@/pages/app/home/(fragments)/category-icon'
import { useAuthContext } from '@/scopes/auth'
import { UniqueTransition } from 'retend-utils/components'

interface HeaderProps {
   category: Category
   transaction: Transaction
}

export const TransactionSheetHeader = (props: HeaderProps) => {
   const { category, transaction } = props
   const { currency } = useAuthContext()
   const arrowDirection = transaction.type === 'expense' ? 'top-right' : 'bottom-left'
   const sign = transaction.type === 'expense' ? '-' : '+'

   return (
      <UniqueTransition
         name={`transaction-sheet-header-${transaction.id}`}
         transitionDuration='var(--sheet-sizing-speed)'
         transitionTimingFunction='ease'
         class='w-full! flex! flex-col items-center gap-y-0.25 border-b-2 border-b-gray-500/50 mb-1'
      >
         {() => (
            <>
               <CategoryIcon icon={category.icon} class='h-4 w-4 border-3 mt-1' />
               <div class='flex justify-center items-center w-full gap-x-0.25 translate-y-[15%]'>
                  <Arrows direction={arrowDirection} class='h-1 w-1 justify-self-end' />
                  <span class='justify-self-start'>{category.name}</span>
               </div>
               <FitText
                  class='col-span-2 min-w-full text-center'
                  scalingFactor={1.5}
                  maxFontSize='var(--text-logo)'
               >
                  {sign}
                  <FormattedMoney currency={currency}>{transaction.amount}</FormattedMoney>
               </FitText>
            </>
         )}
      </UniqueTransition>
   )
}
