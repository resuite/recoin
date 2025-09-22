import { Button } from '@/components/ui/button'
import { Dropdown } from '@/components/ui/dropdown'
import { SafeAreaView } from '@/components/views/safe-area-view'
import { QueryKeys } from '@/constants/query-keys'
import { Cell } from 'retend'
import { useRouteQuery } from 'retend/router'

const CurrencySelection = () => {
   const query = useRouteQuery()
   const currency = Cell.source({ label: 'USD', value: 'USD' })
   const display = new Intl.DisplayNames(['en'], { type: 'currency', style: 'long' })
   const currencyOptions = Intl.supportedValuesOf('currency').map((currency) => ({
      label: `${display.of(currency)} - ${currency}`,
      value: currency
   }))

   const goToInitialBalancePage = () => {
      query.set(QueryKeys.Onboarding.Currency, currency.get().value)
   }

   return (
      <SafeAreaView class='px-1 pt-2 pb-1 grid-lines-with-fade grid grid-rows-[auto_auto_1fr_auto] gap-0.5 animate-stagger-load'>
         <form onSubmit--prevent={goToInitialBalancePage} class='contents'>
            <h1 class='text-logo relative'>
               Welcome <br /> to recoin.
            </h1>
            <p class='text-bigger relative mt-0.5 mb-2'>What is your primary currency?</p>

            <div class='relative'>
               <Dropdown options={currencyOptions} selectedOption={currency} chunkSize={5} />
            </div>

            <Button class='relative' type='submit'>
               Next
            </Button>
         </form>
      </SafeAreaView>
   )
}

export default CurrencySelection
