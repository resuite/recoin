import { Icon } from '@/components/icons'
import Arrows from '@/components/icons/svg/arrows'
import Checkmark from '@/components/icons/svg/checkmark'
import Loader from '@/components/icons/svg/loader'
import { DateInput } from '@/components/ui/date-input'
import { ErrorMessage } from '@/components/ui/error-message'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { LocationInput } from '@/components/ui/location-input'
import { MoneyInput } from '@/components/ui/money-input'
import { TimeInput } from '@/components/ui/time-input'
import {
   type KeyboardVisibilityEvent,
   VirtualKeyboardAwareView,
   VirtualKeyboardTriggers
} from '@/components/views'
import { FadeScrollView } from '@/components/views/fade-scroll-view'
import { QueryKeys } from '@/constants/query-keys'
import { getCategoryById } from '@/data'
import { BackButton } from '@/pages/app/_fragments/back-btn'
import { useAuthContext } from '@/scopes/auth'
import { TransactionDetailsFormScope } from '@/scopes/forms'
import { usePromise } from '@/utilities/composables'
import { scrollIntoView } from '@/utilities/miscellaneous'
import { Cell, Switch, useScopeContext } from 'retend'
import { Input } from 'retend-utils/components'
import { useRouteQuery } from 'retend/router'

const EnterTransactionDetails = () => {
   const query = useRouteQuery()
   const { currency } = useAuthContext()
   const form = useScopeContext(TransactionDetailsFormScope)
   const type = query.get(QueryKeys.TransactionFlow.Type).get() as 'income' | 'expense'
   const arrowDirection = type === 'income' ? 'bottom-left' : 'top-right'
   const scrollViewRef = Cell.source<HTMLElement | null>(null)
   const getCategoryDetails = async () => {
      const chosenCategoryId = query.get(QueryKeys.TransactionFlow.Category).get()
      if (!chosenCategoryId) {
         return null
      }
      return await getCategoryById(chosenCategoryId)
   }
   const selectedCategory = usePromise(getCategoryDetails)
   const keyboardHeight = Cell.source(0)
   const keyboardIsVisible = Cell.source(false)
   const paddingBottom = Cell.derived(() => {
      return `${keyboardHeight.get()}px`
   })

   const handleKeyboardOpen = (event: KeyboardVisibilityEvent) => {
      const scrollView = scrollViewRef.get()
      const { isVisible, approximateHeight } = event
      keyboardHeight.set(approximateHeight)
      keyboardIsVisible.set(isVisible)

      if (isVisible && scrollView !== null) {
         scrollIntoView(event.relatedTarget as HTMLElement, scrollView)
      }
   }

   return (
      <VirtualKeyboardAwareView
         class='px-1 pb-2 grid grid-cols-1 place-items-center gap-1 place-content-center'
         onKeyboardVisibilityChange={handleKeyboardOpen}
      >
         {() => (
            <>
               <BackButton />
               <div>
                  <h2 class='border-b-2 pb-0.25 w-full flex items-center justify-center'>
                     <Arrows class='h-1.25 self-center' direction={arrowDirection} />
                     <span class='text-header'>
                        {Switch(type, {
                           expense: () => 'Expense',
                           income: () => 'Income'
                        })}
                     </span>
                  </h2>
                  {Switch.OnProperty(selectedCategory, 'state', {
                     error: ({ error }) => <ErrorMessage error={error} />,
                     pending: () => <Loader class='h-1.5' />,
                     complete: ({ data: selectedCategory }) => {
                        if (selectedCategory === null) {
                           query.delete(QueryKeys.TransactionFlow.Category)
                           return
                        }
                        return (
                           <sub class='text-bigger flex gap-0.25 items-center justify-center'>
                              <div class='h-1 w-1'>
                                 <Icon name={selectedCategory.icon} />
                              </div>
                              <span>{selectedCategory.name}</span>
                           </sub>
                        )
                     }
                  })}
               </div>
               <p class='text-big text-center'>Share more details about this transaction.</p>
               <FadeScrollView ref={scrollViewRef} class='h-[45dvh] max-h-[45dvh]'>
                  <form
                     style={{ paddingBottom }}
                     class={[
                        '[&_input]:duration-slow [&_input]:transition-opacity',
                        '[&:has(input:focus-within)_input:not(:focus-within)]:opacity-30'
                     ]}
                  >
                     <VirtualKeyboardTriggers class='w-full flex flex-col gap-1'>
                        <MoneyInput
                           model={form.values.amount}
                           currency={currency}
                           autoFocus
                           required
                        />
                        <Input model={form.values.label} type='text' required placeholder='Label' />
                        <DateInput model={form.values.date} placeholder='Date' />
                        <TimeInput model={form.values.time} placeholder='Time' />
                        <LocationInput model={form.values.location} placeholder='Location' />
                     </VirtualKeyboardTriggers>
                     <FloatingActionButton
                        outlined
                        type='submit'
                        class={['bg-transparent', { 'translate-x-[60%]': form.values.amount }]}
                     >
                        <Checkmark class='text-canvas-text' />
                     </FloatingActionButton>
                  </form>
               </FadeScrollView>
            </>
         )}
      </VirtualKeyboardAwareView>
   )
}

export default EnterTransactionDetails
