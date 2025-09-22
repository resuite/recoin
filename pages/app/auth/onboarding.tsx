import { StackView, StackViewGroup } from '@/components/views'
import { QueryKeys } from '@/constants/query-keys'
import CurrencySelection from '@/pages/app/auth/select-currency'
import { useRouteQueryControl } from '@/utilities/composables'
import { useRouter } from 'retend/router'

const Onboarding = () => {
   const router = useRouter()
   const { hasKey: currencyIsSet } = useRouteQueryControl(QueryKeys.Onboarding.Currency)

   return (
      <StackViewGroup>
         <StackView root>{() => <CurrencySelection />}</StackView>
         <StackView isOpen={currencyIsSet} onCloseRequested={() => router.back()}>
            {() => <div>Initial Balance Page</div>}
         </StackView>
      </StackViewGroup>
   )
}

export default Onboarding
