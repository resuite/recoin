import { Cell } from 'retend'
import { UniqueTransition } from 'retend-utils/components'
import { FitText } from '@/components/fit-text'
import { FormattedMoney } from '@/components/formatted-money'
import ArrowBottomLeft from '@/components/icons/svg/arrow-bottom-left'
import ArrowTopRight from '@/components/icons/svg/arrow-top-right'
import { Easing, Speed } from '@/constants'
import type { Category } from '@/database/models/category'
import type { Transaction } from '@/database/models/transaction'
import { CategoryIcon } from '@/pages/app/home/(fragments)/category-icon'
import { useAuthContext } from '@/scopes/auth'

interface HeaderProps {
   category: Category
   transaction: Cell<Transaction>
}

export const TransactionSheetHeader = (props: HeaderProps) => {
   const { category, transaction } = props
   const { currency } = useAuthContext()
   const Arrow = transaction.get().type === 'expense' ? ArrowTopRight : ArrowBottomLeft
   const sign = transaction.get().type === 'expense' ? '-' : '+'
   const amount = Cell.derived(() => {
      return transaction.get().amount
   })

   return (
      <UniqueTransition
         name={`transaction-header-${transaction.get().id}`}
         class='w-full! flex! flex-col items-center gap-y-0.25 border-b-2 border-b-gray-500/50 mb-1'
         transitionTimingFunction={Easing.Timing}
         transitionDuration={`${Speed.Device}ms`}
      >
         {() => (
            <>
               <CategoryIcon icon={category.icon} class='h-4 w-4 border-3 mt-1' />
               <div class='flex justify-center items-center w-full gap-x-0.25 translate-y-[25%]'>
                  <Arrow class='h-1 w-1 justify-self-end' />
                  <span class='justify-self-start'>{category.name}</span>
               </div>
               <FitText
                  class='col-span-2 min-w-full text-center'
                  scalingFactor={1.5}
                  maxFontSize='var(--text-logo)'
               >
                  {sign}
                  <FormattedMoney currency={currency}>{amount}</FormattedMoney>
               </FitText>
            </>
         )}
      </UniqueTransition>
   )
}
