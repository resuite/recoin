import { Cell } from 'retend'
import { useRouteQuery } from 'retend/router'
import { Button } from '@/components/ui/button'
import { Dropdown } from '@/components/ui/dropdown'
import { SafeAreaView } from '@/components/views/safe-area-view'
import { QueryKeys } from '@/constants/query-keys'

const CurrencySelection = () => {
   const query = useRouteQuery()
   const initialCurrency = query.get(QueryKeys.Onboarding.Currency).get()
   const display = new Intl.DisplayNames(['en'], { type: 'currency', style: 'long' })
   const currencyOptions = Intl.supportedValuesOf('currency')
      .map((currency) => ({
         label: `${display.of(currency)} - ${currency}`,
         value: currency
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
   const currency = Cell.source(
      currencyOptions.find((option) => option.value === initialCurrency) ?? currencyOptions[0]
   )

   const goToInitialBalancePage = () => {
      query.set(QueryKeys.Onboarding.Currency, currency.get().value)
   }

   return (
      <SafeAreaView
         elementName='form'
         onSubmit--prevent={goToInitialBalancePage}
         class={[
            'grid place-items-center grid-rows-[1fr_auto] px-0.5 gap-0.5',
            'grid-lines-with-fade'
         ]}
      >
         <div
            class={[
               'pb-5 w-full relative',
               'animate-stagger-load',
               '[--initial-wait:calc(var(--full-screen-transition-speed)*0.5)]',
               '[--stagger-delay:0.35]'
            ]}
         >
            <h1 class='text-large mt-3'>
               Welcome <br /> to recoin.
            </h1>
            <p class='text-bigger mt-0.5 mb-2'>What is your primary currency?</p>
            <Dropdown options={currencyOptions} selectedOption={currency} />
         </div>

         <Button class='relative w-full' type='submit'>
            Next
         </Button>
      </SafeAreaView>
   )
}

export default CurrencySelection
