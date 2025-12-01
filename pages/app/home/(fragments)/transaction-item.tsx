import Arrows from '@/components/icons/svg/arrows'
import { Button } from '@/components/ui/button'
import { FitText } from '@/components/ui/fit-text'
import { FormattedMoney } from '@/components/ui/formatted-money'
import { RelativeTime } from '@/components/ui/relative-time'
import { TRANSACTION_ITEM_HEIGHT } from '@/constants'
import { QueryKeys } from '@/constants/query-keys'
import type { Transaction } from '@/database/models/transaction'
import { CategoryIcon } from '@/pages/app/home/(fragments)/category-icon'
import { useAuthContext } from '@/scopes/auth'
import { useCategory } from '@/utilities/composables/use-categories'
import { formatTime } from '@/utilities/dates'
import { If } from 'retend'
import type { ListTemplateProps } from 'retend-utils/components'
import { useRouteQuery } from 'retend/router'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
   year: '2-digit',
   month: '2-digit',
   day: '2-digit'
})

interface TransactionItemProps extends ListTemplateProps<Transaction> {}

export function TransactionItem(props: TransactionItemProps) {
   const { item } = props
   const category = useCategory(item.categoryId).get()
   const query = useRouteQuery()
   const { currency } = useAuthContext()
   const arrowDirection = item.type === 'expense' ? 'top-right' : 'bottom-left'
   const sign = item.type === 'expense' ? '-' : '+'
   const isToday = dateFormatter.format(item.date) === dateFormatter.format(new Date())

   const openDrawer = () => {
      query.set(QueryKeys.TransactionSheet.OpenItemId, item.id)
   }

   if (!category) {
      return null
   }

   return (
      <Button
         type='button'
         style={{
            contain: 'strict',
            containIntrinsicHeight: TRANSACTION_ITEM_HEIGHT,
            width: 'calc(100dvw - var(--spacing) * 2)',
            containIntrinsicWidth: 'calc(100dvw - var(--spacing) * 2)',
            height: TRANSACTION_ITEM_HEIGHT
         }}
         class={[
            'grid grid-cols-[auto_auto_1fr_auto] grid-rows-2 px-1 w-full whitespace-nowrap',
            'rounded-none',
            'button-bare button-click-effect'
         ]}
         trackClickedState
         onClick={openDrawer}
      >
         <CategoryIcon icon={category.icon} class='h-2 w-2 row-span-2 mr-0.5 self-center' />
         <Arrows
            class='h-(--text-normal) w-(--text-normal) mr-[calc(var(--spacing)*0.15)] mb-[15%] self-end'
            direction={arrowDirection}
         />
         <div
            class='text-normal text-left self-end overflow-ellipsis max-w-full overflow-hidden'
            title={category.name}
         >
            {category.name}
         </div>
         <FitText
            class='w-full min-w-4 text-right self-center justify-end row-span-2 pl-0.5'
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
         <span class='col-span-2 inline-flex items-start gap-0.125 text-canvas-text/70'>
            <span
               class='text-canvas-text/70 max-w-3 overflow-ellipsis overflow-hidden'
               title={item.label}
            >
               {item.label}
            </span>
            •
            {If(isToday, {
               true: () => <RelativeTime date={item.date} />,
               false: () => formatTime(item.date)
            })}
         </span>
      </Button>
   )
}
