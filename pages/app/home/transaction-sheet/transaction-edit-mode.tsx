import Add from '@/components/icons/svg/add'
import Checkmark from '@/components/icons/svg/checkmark'
import { Button } from '@/components/ui/button'
import { DateInput } from '@/components/ui/date-input'
import { LocationInput } from '@/components/ui/location-input'
import { TimeInput } from '@/components/ui/time-input'
import {
   VirtualKeyboardAwareView,
   VirtualKeyboardTriggers
} from '@/components/views/virtual-keyboard-aware-view'
import { QueryKeys } from '@/constants/query-keys'
import type { Category } from '@/database/models/category'
import type { Transaction } from '@/database/models/transaction'
import { TransactionSheetHeader } from '@/pages/app/home/transaction-sheet/(fragments)/transaction-sheet-header'
import { useRouteQueryControl } from '@/utilities/composables/use-route-query-control'
import { createForm } from '@/utilities/form'
import { Input } from 'retend-utils/components'

interface TransactionEditModeProps {
   transaction: Transaction
   category: Category
}

const TransactionEditMode = (props: TransactionEditModeProps) => {
   const { transaction, category } = props
   const { remove: closeEditMode } = useRouteQueryControl(QueryKeys.TransactionSheet.IsInEditMode)

   const form = createForm(() => ({
      amount: transaction.amount,
      label: transaction.label,
      date: transaction.date,
      time: transaction.date.toTimeString().slice(0, 5),
      location: transaction.location || ''
   }))

   return (
      <>
         <div class='w-full'>
            <TransactionSheetHeader transaction={transaction} category={category} />
            <VirtualKeyboardAwareView>
               {() => (
                  <VirtualKeyboardTriggers
                     style={{
                        animationTimingFunction: 'ease',
                        animationDuration: 'var(--sheet-sizing-speed)'
                     }}
                     class={[
                        'grid grid-rows-4 gap-y-1 mb-1.5',
                        'animate-fade-in [--starting-translate:0_40%] [--starting-opacity:0]'
                     ]}
                  >
                     <Input model={form.values.label} placeholder='Label' />
                     <DateInput model={form.values.date} placeholder='Date' />
                     <TimeInput model={form.values.time} placeholder='Time' />
                     <LocationInput model={form.values.location} placeholder='Location' />
                  </VirtualKeyboardTriggers>
               )}
            </VirtualKeyboardAwareView>
         </div>
         <div class='w-full gap-1 grid grid-cols-2'>
            <Button class='w-full btn-outline' onClick={closeEditMode}>
               <Add class='btn-icon rotate-45' />
               Discard
            </Button>
            <Button class='w-full border-canvas-text'>
               <Checkmark class='btn-icon' />
               Save
            </Button>
         </div>
      </>
   )
}

export default TransactionEditMode
