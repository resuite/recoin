import { Icon } from '@/components/icons'
import Arrows from '@/components/icons/svg/arrows'
import { FitText } from '@/components/ui/fit-text'
import { FormattedMoney } from '@/components/ui/formatted-money'
import { RelativeTime } from '@/components/ui/relative-time'
import type { Transaction } from '@/database/models/transaction'
import { useAuthContext } from '@/scopes/auth'
import { useCategory } from '@/utilities/composables/use-categories'
import type { ListTemplateProps } from 'retend-utils/components'

interface TransactionItemProps extends ListTemplateProps<Transaction> {}

export function TransactionItem(props: TransactionItemProps) {
   const { item } = props
   const category = useCategory(item.categoryId).get()
   const { currency } = useAuthContext()
   const arrowDirection = item.type === 'expense' ? 'top-right' : 'bottom-left'
   const sign = item.type === 'expense' ? '-' : '+'

   if (!category) {
      return null
   }

   return (
      <div class='grid grid-cols-[auto_auto_1fr_auto] grid-rows-2 py-1 w-full whitespace-nowrap'>
         <div class='h-2 w-2 rounded-full mr-0.5 border-2 grid place-items-center row-span-2'>
            <Icon name={category.icon} class='h-1 w-1' />
         </div>
         <Arrows
            class='h-(--text-normal) w-(--text-normal) mr-[calc(var(--spacing)*0.15)] self-center'
            direction={arrowDirection}
         />
         <div
            class='text-normal text-left self-center overflow-ellipsis max-w-0 min-w-[200px] overflow-hidden'
            title={category.name}
         >
            {category.name}
         </div>
         <FitText
            class='w-full min-w-4 text-right justify-end row-span-2 pl-0.5'
            scalingFactor={1.7}
            maxFontSize='var(--text-bigger)'
         >
            {sign}
            <FormattedMoney
               currency={currency}
               minimumFractionDigits={0}
               showCurrencySymbol={false}
            >
               {item.amount}
            </FormattedMoney>
         </FitText>
         <span class='col-span-2 inline-flex items-center gap-0.125 text-canvas-text/70'>
            <span
               class='text-canvas-text/70 max-w-3 overflow-ellipsis overflow-hidden'
               title={item.label}
            >
               {item.label}
            </span>
            •
            <RelativeTime date={item.date} />
         </span>
      </div>
   )
}
