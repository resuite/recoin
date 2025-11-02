import Arrows from '@/components/icons/svg/arrows'
import Bin from '@/components/icons/svg/bin'
import Pencil from '@/components/icons/svg/pencil'
import { Button } from '@/components/ui/button'
import { FitText } from '@/components/ui/fit-text'
import { FormattedMoney } from '@/components/ui/formatted-money'
import { InfoList, InfoListItem } from '@/components/ui/info-list'
import { SafeAreaView } from '@/components/views/safe-area-view'
import { QueryKeys } from '@/constants/query-keys'
import { CategoryIcon } from '@/pages/app/home/(fragments)/category-icon'
import { useAuthContext } from '@/scopes/auth'
import { useCategory } from '@/utilities/composables/use-categories'
import { useTransaction } from '@/utilities/composables/use-transactions'
import { useRouteQuery } from 'retend/router'

export function TransactionItemBottomSheet() {
   const query = useRouteQuery()
   const { currency } = useAuthContext()
   const transactionId = query.get(QueryKeys.RecentTransactions.OpenItemId).get()
   if (!transactionId) {
      return null
   }
   const transaction = useTransaction(transactionId).get()
   if (!transaction) {
      return null
   }
   const arrowDirection = transaction.type === 'expense' ? 'top-right' : 'bottom-left'
   const sign = transaction.type === 'expense' ? '-' : '+'
   const category = useCategory(transaction.categoryId).get()
   const date = transaction.date.toLocaleDateString('en-GB', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
   })
   const time = transaction.date.toLocaleTimeString('en-GB', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
   })
   if (!category) {
      return null
   }

   return (
      <SafeAreaView class='grid justify-center place-items-center gap-y-0.25 grid-cols-1 h-full w-full'>
         <CategoryIcon icon={category.icon} class='h-4 w-4 col-span-2 border-3 mt-1' />
         <div class='flex justify-center items-center gap-x-0.25'>
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
         <InfoList class='col-span-2 mb-1.25'>
            <InfoListItem label='Label' value={transaction.label} />
            <InfoListItem label='Date' value={date} />
            <InfoListItem label='Time' value={time} />
            <InfoListItem label='Location' value={transaction.location || 'Not Provided'} />
         </InfoList>
         <div class='w-full gap-1 grid grid-cols-2'>
            <Button class='w-full btn-outline'>
               <Bin class='btn-icon' />
               Delete
            </Button>
            <Button class='w-full border-canvas-text'>
               <Pencil class='btn-icon' />
               Edit
            </Button>
         </div>
      </SafeAreaView>
   )
}
