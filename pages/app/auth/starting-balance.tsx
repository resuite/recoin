import { Cell, If } from 'retend'
import { useRouteQuery } from 'retend/router'
import { Button } from '@/components/button'
import Loader from '@/components/icons/svg/loader'
import { MoneyInput } from '@/components/money-input'
import { SafeAreaView } from '@/components/safe-area-view'
import {
   type KeyboardVisibilityEvent,
   VirtualKeyboardAwareView,
   VirtualKeyboardTriggers
} from '@/components/virtual-keyboard-aware-view'
import { QueryKeys } from '@/constants/query-keys'
import { useAuthContext } from '@/scopes/auth'

interface StartingBalanceProps {
   onFinish: (startingBalance: number) => void
}

const StartingBalance = (props: StartingBalanceProps) => {
   const { onFinish } = props
   const { completeSetup } = useAuthContext()
   const query = useRouteQuery()
   const currency = query.get(QueryKeys.Onboarding.Currency).get()
   const value = Cell.source(0)
   const keyboardIsOpen = Cell.source(false)

   if (!currency) {
      return null
   }

   const goBackToCurrency = () => {
      query.delete(QueryKeys.Onboarding.Currency)
   }

   const handleSubmit = () => {
      onFinish(value.get())
   }

   const handleKeyboardVisibilityChange = (event: KeyboardVisibilityEvent) => {
      keyboardIsOpen.set(event.isVisible)
   }

   return (
      <VirtualKeyboardAwareView onKeyboardVisibilityChange={handleKeyboardVisibilityChange}>
         {() => (
            <SafeAreaView
               containerClass='grid-lines-with-fade'
               elementName='form'
               class='grid grid-cols-1 grid-rows-[1fr_auto] place-items-center place-content-center'
               onSubmit--prevent={handleSubmit}
            >
               <div
                  class={[
                     'duration-slow transition-transform',
                     { '-translate-y-2': keyboardIsOpen }
                  ]}
               >
                  <h2
                     class={[
                        'text-title',
                        'duration-slow origin-left transition-transform',
                        { 'scale-95': keyboardIsOpen }
                     ]}
                  >
                     What should be your starting balance?
                  </h2>
                  <VirtualKeyboardTriggers class='self-start w-full py-1.5'>
                     <MoneyInput minlength={3} currency={currency} model={value} />
                  </VirtualKeyboardTriggers>
               </div>
               <div class='w-full grid grid-cols-1 grid-rows-2 gap-y-0.5'>
                  <Button class='btn-outline' onClick={goBackToCurrency}>
                     Back
                  </Button>
                  <Button class='border-4 border-light-yellow' type='submit'>
                     {If(completeSetup.pending, {
                        true: () => (
                           <>
                              <Loader class='btn-icon mr-0.25' /> Finishing...
                           </>
                        ),
                        false: () => 'Finish'
                     })}
                  </Button>
               </div>
            </SafeAreaView>
         )}
      </VirtualKeyboardAwareView>
   )
}

export default StartingBalance
