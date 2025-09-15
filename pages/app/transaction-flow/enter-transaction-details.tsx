import { Icon } from '@/components/icons'
import Arrows from '@/components/icons/svg/arrows'
import Checkmark from '@/components/icons/svg/checkmark'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { MoneyInput } from '@/components/ui/money-input'
import {
   type KeyboardVisibilityEvent,
   VirtualKeyboardAwareView,
   VirtualKeyboardTriggers
} from '@/components/views'
import { FadeScrollView } from '@/components/views/fade-scroll-view'
import { QueryKeys } from '@/constants/query-keys'
import { defaultCurrency, defaultExpenseCategories, defaultIncomeCategories } from '@/data'
import { BackButton } from '@/pages/app/$fragments/back-btn'
import { NewTransactionDetailsScope } from '@/scopes/forms'
import { Cell, Switch, useScopeContext } from 'retend'
import { Input } from 'retend-utils/components'
import { useRouteQuery } from 'retend/router'

const EnterTransactionDetails = () => {
   const query = useRouteQuery()
   const { amount } = useScopeContext(NewTransactionDetailsScope)
   const type = query.get(QueryKeys.TransactionFlow.Type).get() as 'income' | 'expense'
   const chosenCategory = query.get(QueryKeys.TransactionFlow.Category)
   const arrowDirection = type === 'income' ? 'bottom-left' : 'top-right'
   const categoryList = type === 'income' ? defaultIncomeCategories : defaultExpenseCategories
   const selectedCategory = categoryList.find((category) => {
      return category.key === chosenCategory.get()
   })
   const keyboardHeight = Cell.source(0)
   const keyboardIsVisible = Cell.source(false)
   const paddingBottom = Cell.derived(() => {
      return `${keyboardHeight.get()}px`
   })

   if (!selectedCategory) {
      query.delete(QueryKeys.TransactionFlow.Category)
      return
   }

   const handleKeyboardOpen = (event: KeyboardVisibilityEvent) => {
      keyboardHeight.set(event.approximateHeight)
      keyboardIsVisible.set(event.isVisible)
      if (event.isVisible) {
         const focusedElement = event.relatedTarget as HTMLElement
         focusedElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
   }

   return (
      <VirtualKeyboardAwareView
         class='px-1 pb-2 grid place-items-center gap-1 place-content-center'
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
                           expense: () => <>Expense</>,
                           income: () => <>Income</>
                        })}
                     </span>
                  </h2>
                  <sub class='text-bigger flex gap-0.25 items-center justify-center'>
                     <div class='h-1 w-1'>
                        <Icon name={selectedCategory.icon} />
                     </div>
                     <span>{selectedCategory.name}</span>
                  </sub>
               </div>
               <p class='text-big text-center'>Share more details about this transaction.</p>
               <FadeScrollView class='max-h-[45dvh]'>
                  <form
                     style={{ paddingBottom }}
                     class={[
                        '[&_input]:duration-default [&_input]:transition-opacity',
                        '[&:has(input:focus-within)_input:not(:focus-within)]:opacity-30'
                     ]}
                  >
                     <VirtualKeyboardTriggers class='w-full flex flex-col gap-1'>
                        <MoneyInput model={amount} currency={defaultCurrency} />
                        <Input type='text' placeholder='Label' />
                        <Input type='date' placeholder='Amount' />
                        <Input type='time' placeholder='Amount' />
                        <Input type='text' placeholder='Label' />
                     </VirtualKeyboardTriggers>
                  </form>
               </FadeScrollView>
               <FloatingActionButton
                  outlined
                  type='submit'
                  class={['bg-transparent', { 'translate-x-[60%]': amount }]}
               >
                  <Checkmark class='text-canvas-text' />
               </FloatingActionButton>
            </>
         )}
      </VirtualKeyboardAwareView>
   )
}

export default EnterTransactionDetails
