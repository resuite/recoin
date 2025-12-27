import { Cell } from 'retend'
import { MaskIcon } from '@/components/icons/icon-mask'
import Bin from '@/components/icons/svg/bin'
import Pencil from '@/components/icons/svg/pencil'
import { Button } from '@/components/ui/button'
import { InfoList, InfoListItem } from '@/components/ui/info-list'
import { SHEET_SIZING_ANIMATION_STYLES } from '@/constants'
import { QueryKeys } from '@/constants/query-keys'
import type { Category } from '@/database/models/category'
import type { Transaction } from '@/database/models/transaction'
import { TransactionSheetHeader } from '@/pages/app/home/transaction-sheet/(fragments)/transaction-sheet-header'
import { useRouteQueryControl } from '@/utilities/composables/use-route-query-control'

interface TransactionViewModeProps {
   transaction: Cell<Transaction>
   category: Category
   animateDirection: Cell<'up' | 'down' | null>
}

const TransactionViewMode = (props: TransactionViewModeProps) => {
   const { transaction, category, animateDirection } = props
   const { add: goToEditMode } = useRouteQueryControl(QueryKeys.TransactionSheet.Mode, 'Edit')
   const { add: goToDeleteMode } = useRouteQueryControl(QueryKeys.TransactionSheet.Mode, 'Delete')
   const label = Cell.derived(() => {
      return transaction.get().label
   })
   const animatingDown = Cell.derived(() => {
      return animateDirection.get() === 'down'
   })
   const animatingUp = Cell.derived(() => {
      return animateDirection.get() === 'up'
   })
   const date = Cell.derived(() => {
      return transaction.get().date.toLocaleDateString('en-GB', {
         month: 'long',
         day: 'numeric',
         year: 'numeric'
      })
   })
   const time = Cell.derived(() => {
      return transaction.get().date.toLocaleTimeString('en-GB', {
         hour: 'numeric',
         minute: 'numeric',
         hour12: true
      })
   })
   const location = Cell.derived(() => {
      return transaction.get().location || 'Not Provided'
   })

   return (
      <>
         <div
            class={['w-full', { 'animate-fade-in [--starting-translate:0_-70%]': animatingDown }]}
            style={SHEET_SIZING_ANIMATION_STYLES}
         >
            <TransactionSheetHeader transaction={transaction} category={category} />
            <InfoList
               class={[
                  'col-span-2 mb-1.25',
                  { 'animate-fade-in [--starting-translate:0_50%]': animatingUp }
               ]}
               style={SHEET_SIZING_ANIMATION_STYLES}
            >
               <InfoListItem label='Label' value={label} />
               <InfoListItem label='Date' value={date} />
               <InfoListItem label='Time' value={time} />
               <InfoListItem label='Location' value={location} />
            </InfoList>
         </div>
         <div class='w-full gap-1 grid grid-cols-2'>
            <Button class='w-full btn-outline' onClick={goToDeleteMode}>
               <MaskIcon src={Bin} class='btn-icon bg-current' />
               Delete
            </Button>
            <Button class='w-full border-canvas-text' onClick={goToEditMode}>
               <MaskIcon src={Pencil} class='btn-icon bg-current' />
               Edit
            </Button>
         </div>
      </>
   )
}

export default TransactionViewMode
