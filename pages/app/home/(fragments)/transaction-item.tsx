import Arrows from '@/components/icons/svg/arrows'
import { FitText } from '@/components/ui/fit-text'
import { FormattedMoney } from '@/components/ui/formatted-money'
import { RelativeTime } from '@/components/ui/relative-time'
import { QueryKeys } from '@/constants/query-keys'
import { VibrationPatterns } from '@/constants/vibration'
import type { Transaction } from '@/database/models/transaction'
import { CategoryIcon } from '@/pages/app/home/(fragments)/category-icon'
import { useAuthContext } from '@/scopes/auth'
import { useCategory } from '@/utilities/composables/use-categories'
import { vibrate } from '@/utilities/miscellaneous'
import type { ListTemplateProps } from 'retend-utils/components'
import { useRouteQuery } from 'retend/router'

interface TransactionItemProps extends ListTemplateProps<Transaction> {}

export function TransactionItem(props: TransactionItemProps) {
   const { item } = props
   const category = useCategory(item.categoryId).get()
   const query = useRouteQuery()
   const { currency } = useAuthContext()
   const arrowDirection = item.type === 'expense' ? 'top-right' : 'bottom-left'
   const sign = item.type === 'expense' ? '-' : '+'

   const openDrawer = () => {
      vibrate(VibrationPatterns.ButtonPress)
      query.set(QueryKeys.RecentTransactions.OpenItemId, item.id)
   }

   if (!category) {
      return null
   }

   return (
      <button
         type='button'
         class={[
            'grid grid-cols-[auto_auto_1fr_auto] grid-rows-2 px-1 w-full whitespace-nowrap button-bare',
            'rounded-none my-0.25 py-0.75 duration-default transition-transform',
            'active:bg-gray-100 active:scale-95'
         ]}
         onClick={openDrawer}
      >
         <CategoryIcon icon={category.icon} class='h-2 w-2 row-span-2 mr-0.5' />
         <Arrows
            class='h-(--text-normal) w-(--text-normal) mr-[calc(var(--spacing)*0.15)] self-center'
            direction={arrowDirection}
         />
         <div
            class='text-normal text-left self-center overflow-ellipsis max-w-full overflow-hidden'
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
      </button>
   )
}
