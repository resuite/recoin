import { Cell, If, useScopeContext } from 'retend'
import { useRouteQuery } from 'retend/router'
import type { TransactionType } from '@/api/database/types'
import { Button } from '@/components/button'
import { DateInput } from '@/components/date-input'
import { Icon } from '@/components/icons'
import ArrowBottomLeft from '@/components/icons/svg/arrow-bottom-left'
import ArrowTopRight from '@/components/icons/svg/arrow-top-right'
import Checkmark from '@/components/icons/svg/checkmark'
import { Input } from '@/components/input'
import { LocationInput } from '@/components/location-input'
import { MoneyInput } from '@/components/money-input'
import { ScrollView } from '@/components/scroll-view'
import { TimeInput } from '@/components/time-input'
import {
   type KeyboardVisibilityEvent,
   VirtualKeyboardAwareView,
   VirtualKeyboardTriggers
} from '@/components/virtual-keyboard-aware-view'
import { QueryKeys } from '@/constants/query-keys'
import { VibrationPatterns } from '@/constants/vibration'
import { BackButton } from '@/pages/app/(fragments)/back-btn'
import { TransactionTypeName } from '@/pages/app/(fragments)/transaction-type-name'
import { useAuthContext } from '@/scopes/auth'
import { TransactionDetailsFormScope } from '@/scopes/forms'
import { useCategory } from '@/utilities/composables/use-categories'
import { useRouteQueryControl } from '@/utilities/composables/use-route-query-control'
import { scrollIntoView, vibrate } from '@/utilities/miscellaneous'

const EnterTransactionDetails = () => {
   const query = useRouteQuery()
   const { currency } = useAuthContext()
   const form = useScopeContext(TransactionDetailsFormScope)
   const formId = 'transaction-details-form'
   const type = query.get(QueryKeys.TransactionFlow.Type).get() as TransactionType
   const { add: completeTransactionFlow } = useRouteQueryControl(QueryKeys.TransactionFlow.Success)
   const Arrow = type === 'income' ? ArrowBottomLeft : ArrowTopRight
   const scrollViewRef = Cell.source<HTMLElement | null>(null)
   const chosenCategoryId = query.get(QueryKeys.TransactionFlow.Category).get()
   const selectedCategory = useCategory(chosenCategoryId)
   const keyboardHeight = Cell.source(0)
   const keyboardIsVisible = Cell.source(false)
   const paddingBottom = Cell.derived(() => {
      return `${keyboardHeight.get()}px`
   })

   const handleKeyboardOpen = (event: KeyboardVisibilityEvent) => {
      const scrollView = scrollViewRef.peek()
      const { isVisible, approximateHeight } = event
      keyboardHeight.set(approximateHeight)
      keyboardIsVisible.set(isVisible)

      if (isVisible && scrollView !== null) {
         scrollIntoView(event.relatedTarget as HTMLElement, scrollView)
      }
   }

   const handleSubmit = () => {
      vibrate(VibrationPatterns.ButtonPress)
      form.submit()
      completeTransactionFlow()
   }

   return (
      <VirtualKeyboardAwareView
         class='px-1 pb-2 grid grid-cols-1 place-items-center relative gap-1 place-content-center'
         onKeyboardVisibilityChange={handleKeyboardOpen}
      >
         {() => (
            <>
               <BackButton class='absolute top-1 mt-(--safe-area-inset-top) left-1' />
               <div>
                  <h2 class='border-b-2 pb-0.25 w-full flex items-center justify-center'>
                     <Arrow class='h-1.25 self-center' />
                     <span class='text-header'>
                        <TransactionTypeName type={type} />
                     </span>
                  </h2>
                  {If(selectedCategory, (selectedCategory) => (
                     <sub class='text-bigger flex gap-0.25 items-center justify-center'>
                        <div class='h-1 w-1'>
                           <Icon name={selectedCategory.icon} class='h-1' />
                        </div>
                        <span>{selectedCategory.name}</span>
                     </sub>
                  ))}
               </div>
               <p class='text-big text-center'>Share more details about this transaction.</p>
               <ScrollView ref={scrollViewRef} class='h-[45dvh] max-h-[45dvh]'>
                  {() => (
                     <form
                        id={formId}
                        style={{ paddingBottom }}
                        class='[&_input]:duration-slow [&_input]:transition-opacity'
                        onSubmit--prevent={handleSubmit}
                     >
                        <VirtualKeyboardTriggers class='w-full flex flex-col gap-1'>
                           <MoneyInput model={form.values.amount} currency={currency} required />
                           <Input label='Label' model={form.values.label} type='text' required />
                           <DateInput model={form.values.date} label='Date' />
                           <TimeInput model={form.values.time} label='Time' />
                           <LocationInput
                              model={form.values.location}
                              label='Location (Optional)'
                           />
                        </VirtualKeyboardTriggers>
                     </form>
                  )}
               </ScrollView>
               {If(form.values.amount, () => (
                  <Button
                     type='submit'
                     form={formId}
                     class='absolute! bottom-0 mb-2 w-[calc(100%-var(--spacing)*2)]'
                  >
                     <Checkmark class='btn-icon' />
                     Save Transaction
                  </Button>
               ))}
            </>
         )}
      </VirtualKeyboardAwareView>
   )
}

export default EnterTransactionDetails
