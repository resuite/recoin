import { useToast } from '@/components/ui/toast'
import { StackView, StackViewGroup } from '@/components/views'
import { QueryKeys } from '@/constants/query-keys'
import CurrencySelection from '@/pages/app/auth/select-currency'
import StartingBalance from '@/pages/app/auth/starting-balance'
import { useAuthContext } from '@/scopes/auth'
import { useRouteQueryControl } from '@/utilities/composables'
import { useRouteQuery, useRouter } from 'retend/router'

const Onboarding = () => {
   const router = useRouter()
   const query = useRouteQuery()
   const { completeSetup } = useAuthContext()
   const { showToast } = useToast()
   const { hasKey: currencyIsSet } = useRouteQueryControl(QueryKeys.Onboarding.Currency)
   const currency = query.get(QueryKeys.Onboarding.Currency)

   const handleFinish = (startingBalance: number) => {
      const currencyValue = currency.get()
      if (!currencyValue) {
         showToast({ content: 'Please select a currency.', duration: 2000 })
         return
      }
      completeSetup.run({ currency: currencyValue, startingBalance })
   }

   return (
      <StackViewGroup>
         <StackView root>{() => <CurrencySelection />}</StackView>
         <StackView isOpen={currencyIsSet} onCloseRequested={router.back}>
            {() => <StartingBalance onFinish={handleFinish} />}
         </StackView>
      </StackViewGroup>
   )
}

export default Onboarding
