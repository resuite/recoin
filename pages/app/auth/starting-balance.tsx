import Loader from '@/components/icons/svg/loader'
import { Button } from '@/components/ui/button'
import { MoneyInput } from '@/components/ui/money-input'
import { SafeAreaView } from '@/components/views/safe-area-view'
import {
   VirtualKeyboardAwareView,
   VirtualKeyboardTriggers
} from '@/components/views/virtual-keyboard-aware-view'
import { QueryKeys } from '@/constants/query-keys'
import { useAuthContext } from '@/scopes/auth'
import { Cell, If } from 'retend'
import { useRouteQuery } from 'retend/router'

interface StartingBalanceProps {
   onFinish: (startingBalance: number) => void
}

const StartingBalance = (props: StartingBalanceProps) => {
   const { onFinish } = props
   const { completeSetup } = useAuthContext()
   const query = useRouteQuery()
   const currency = query.get(QueryKeys.Onboarding.Currency).get()
   const value = Cell.source(0)

   if (!currency) {
      return null
   }

   const goBackToCurrency = () => {
      query.delete(QueryKeys.Onboarding.Currency)
   }

   const handleSubmit = () => {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.log('handleSubmit')
      onFinish(value.get())
   }

   return (
      <VirtualKeyboardAwareView>
         {() => (
            <SafeAreaView
               elementName='form'
               class={[
                  'px-1 pt-2 pb-1',
                  'grid grid-lines-with-fade grid-cols-1 grid-rows-[.25fr_1fr_auto] place-items-center place-content-center'
               ]}
               onSubmit--prevent={handleSubmit}
            >
               <h2 class='text-title'>What should be your starting balance?</h2>
               <VirtualKeyboardTriggers class='self-start w-full py-1.5'>
                  <MoneyInput minlength={3} currency={currency} model={value} />
               </VirtualKeyboardTriggers>
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
