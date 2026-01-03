import { Cell, useSetupEffect } from 'retend'
import { useBottomSheetContext } from '@/components/bottom-sheet-view'
import { Button } from '@/components/button'
import { DateInput } from '@/components/date-input'
import Add from '@/components/icons/svg/add'
import Checkmark from '@/components/icons/svg/checkmark'
import { Input } from '@/components/input'
import { LocationInput } from '@/components/location-input'
import { ScrollView } from '@/components/scroll-view'
import { TimeInput } from '@/components/time-input'
import { useToast } from '@/components/toast'
import {
   type KeyboardVisibilityEvent,
   VirtualKeyboardAwareView,
   VirtualKeyboardTriggers
} from '@/components/virtual-keyboard-aware-view'
import { SHEET_SIZING_ANIMATION_STYLES, TOAST_DEFAULT_DURATION } from '@/constants'
import { QueryKeys } from '@/constants/query-keys'
import type { Transaction } from '@/database/models/transaction'
import TransactionModel from '@/database/models/transaction'
import { BottomSheetHeader } from '@/pages/app/(fragments)/bottom-sheet-header'
import { ToastMessage } from '@/pages/app/(fragments)/toast-message'
import { useStore } from '@/scopes/livestore'
import { animationsSettled } from '@/utilities/animations'
import { useRouteQueryControl } from '@/utilities/composables/use-route-query-control'
import { createForm } from '@/utilities/form'
import { mergeDateAndTime, scrollIntoView } from '@/utilities/miscellaneous'

interface TransactionEditModeProps {
   transaction: Cell<Transaction>
   onLoad: () => void
}

const TransactionEditMode = (props: TransactionEditModeProps) => {
   const { transaction, onLoad } = props
   const { remove: closeEditMode } = useRouteQueryControl(QueryKeys.TransactionSheet.Mode, 'Edit')
   const bottomSheetCtx = useBottomSheetContext()
   const store = useStore()
   const { showToast } = useToast()
   const keyboardHeight = Cell.source(0)
   const keyboardHeightPx = Cell.derived(() => {
      return `${keyboardHeight.get()}px`
   })
   const keyboardIsVisible = Cell.source(false)
   const scrollViewRef = Cell.source<HTMLElement | null>(null)
   const contentRef = Cell.source<HTMLElement | null>(null)
   const labelRef = Cell.source<HTMLInputElement | null>(null)

   const form = createForm(() => ({
      amount: transaction.get().amount,
      label: transaction.get().label,
      date: transaction.get().date,
      time: transaction.get().date.toTimeString().slice(0, 5),
      location: transaction.get().location || ''
   }))

   const handleKeyboardVisibilityChange = (event: KeyboardVisibilityEvent) => {
      const { isVisible, approximateHeight } = event
      const scrollView = scrollViewRef.get()
      keyboardIsVisible.set(isVisible)
      if (isVisible) {
         keyboardHeight.set(approximateHeight)
      } else if (scrollView) {
         scrollView?.scrollTo({ top: 0, behavior: 'smooth' })
      }
   }

   const handleFocus = (event: FocusEvent) => {
      const scrollView = scrollViewRef.get()
      const element = event.target as HTMLElement
      if (scrollView) {
         scrollIntoView(element, scrollView, 45)
      }
   }

   const handleSave = async () => {
      const values = await form.submit()
      const updatedTransaction = {
         id: transaction.get().id,
         workspaceId: transaction.get().workspaceId,
         categoryId: transaction.get().categoryId,
         type: transaction.get().type,
         amount: values.amount,
         currency: transaction.get().currency,
         label: values.label,
         date: mergeDateAndTime(values.date, values.time),
         location: values.location
      }
      store.commit(TransactionModel.events.transactionEdited(updatedTransaction))
      showToast({
         content: <ToastMessage Icon={Checkmark} message='Transaction updated.' />,
         duration: TOAST_DEFAULT_DURATION
      })
      closeEditMode()
   }

   useSetupEffect(async () => {
      onLoad()
      bottomSheetCtx.resizeToScreen()
      await animationsSettled(contentRef)
      labelRef.peek()?.focus()

      return () => {
         bottomSheetCtx.resizeToContent()
      }
   })

   return (
      <form class='w-full h-full grid grid-rows-[1fr_auto] pt-1.5' onSubmit--prevent={handleSave}>
         <div
            ref={contentRef}
            class={[
               'grid grid-rows-[auto_1fr] gap-y-1',
               'animate-fade-in [--starting-translate:0_40%]'
            ]}
            style={SHEET_SIZING_ANIMATION_STYLES}
         >
            <BottomSheetHeader
               style={{ viewTransitionName: 'bottom-sheet-header' }}
               subText='Review and update the info for this transaction.'
            >
               Edit Transaction Details.
            </BottomSheetHeader>
            <VirtualKeyboardAwareView onKeyboardVisibilityChange={handleKeyboardVisibilityChange}>
               {() => (
                  <ScrollView
                     ref={scrollViewRef}
                     class={[
                        'min-h-0 max-h-[55dvh] snap-y snap-mandatory',
                        'after:block after:h-(--keyboard-height)'
                     ]}
                     style={{ '--keyboard-height': keyboardHeightPx }}
                  >
                     {() => (
                        <VirtualKeyboardTriggers class='grid grid-rows-[repeat(4,auto)_0] gap-y-1'>
                           <Input
                              ref={labelRef}
                              label='Label'
                              model={form.values.label}
                              onFocus={handleFocus}
                              required
                           />
                           <DateInput model={form.values.date} label='Date' />
                           <TimeInput model={form.values.time} label='Time' />
                           <LocationInput
                              model={form.values.location}
                              label='Location'
                              onFocus={handleFocus}
                           />
                        </VirtualKeyboardTriggers>
                     )}
                  </ScrollView>
               )}
            </VirtualKeyboardAwareView>
         </div>
         <div class='w-full gap-1 grid grid-cols-2 isolate'>
            <Button class='w-full btn-outline' onClick={() => closeEditMode()}>
               <Add class='btn-icon rotate-45' />
               Discard
            </Button>
            <Button type='submit' class='w-full border-canvas-text'>
               <Checkmark class='btn-icon' />
               Save
            </Button>
         </div>
      </form>
   )
}

export default TransactionEditMode
