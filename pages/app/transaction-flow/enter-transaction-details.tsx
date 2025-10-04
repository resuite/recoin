import type { TransactionType } from '@/api/database/types'
import { Icon } from '@/components/icons'
import Arrows from '@/components/icons/svg/arrows'
import Checkmark from '@/components/icons/svg/checkmark'
import { DateInput } from '@/components/ui/date-input'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { LocationInput } from '@/components/ui/location-input'
import { MoneyInput } from '@/components/ui/money-input'
import { TimeInput } from '@/components/ui/time-input'
import { FadeScrollView } from '@/components/views/fade-scroll-view'
import {
   type KeyboardVisibilityEvent,
   VirtualKeyboardAwareView,
   VirtualKeyboardTriggers
} from '@/components/views/virtual-keyboard-aware-view'
import { QueryKeys } from '@/constants/query-keys'
import { BackButton } from '@/pages/app/(fragments)/back-btn'
import { TransactionTypeName } from '@/pages/app/(fragments)/transaction-type-name'
import { useAuthContext } from '@/scopes/auth'
import { TransactionDetailsFormScope } from '@/scopes/forms'
import { useCategory } from '@/utilities/composables/use-categories'
import { useRouteQueryControl } from '@/utilities/composables/use-route-query-control'
import { scrollIntoView } from '@/utilities/miscellaneous'
import { Cell, If, useScopeContext } from 'retend'
import { Input } from 'retend-utils/components'
import { useRouteQuery } from 'retend/router'

const EnterTransactionDetails = () => {
   const query = useRouteQuery()
   const { currency } = useAuthContext()
   const form = useScopeContext(TransactionDetailsFormScope)
   const type = query.get(QueryKeys.TransactionFlow.Type).get() as TransactionType
   const { add: completeTransactionFlow } = useRouteQueryControl(QueryKeys.TransactionFlow.Success)
   const arrowDirection = type === 'income' ? 'bottom-left' : 'top-right'
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
      form.submit()
      completeTransactionFlow()
   }

   return (
      <VirtualKeyboardAwareView
         class='px-1 pb-2 grid grid-cols-1 place-items-center gap-1 place-content-center'
         onKeyboardVisibilityChange={handleKeyboardOpen}
      >
         {() => (
            <>
               <BackButton class='absolute top-2 left-1' />
               <div>
                  <h2 class='border-b-2 pb-0.25 w-full flex items-center justify-center'>
                     <Arrows class='h-1.25 self-center' direction={arrowDirection} />
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
               <FadeScrollView ref={scrollViewRef} class='h-[45dvh] max-h-[45dvh]'>
                  <form
                     style={{ paddingBottom }}
                     class='[&_input]:duration-slow [&_input]:transition-opacity'
                     onSubmit--prevent={handleSubmit}
                  >
                     <VirtualKeyboardTriggers class='w-full flex flex-col gap-1'>
                        <MoneyInput model={form.values.amount} currency={currency} required />
                        <Input model={form.values.label} type='text' required placeholder='Label' />
                        <DateInput model={form.values.date} placeholder='Date' />
                        <TimeInput model={form.values.time} placeholder='Time' />
                        <LocationInput
                           model={form.values.location}
                           placeholder='Location (Optional)'
                        />
                     </VirtualKeyboardTriggers>
                     {If(form.values.amount, () => (
                        <FloatingActionButton
                           outlined
                           fixed
                           type='submit'
                           class='bg-transparent translate-x-[60%]'
                        >
                           <Checkmark class='text-canvas-text' />
                        </FloatingActionButton>
                     ))}
                  </form>
               </FadeScrollView>
            </>
         )}
      </VirtualKeyboardAwareView>
   )
}

export default EnterTransactionDetails
