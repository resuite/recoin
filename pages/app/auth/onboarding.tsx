import { Cell, useSetupEffect } from 'retend'
import { useRouteQuery, useRouter } from 'retend/router'
import { StackView, StackViewGroup } from '@/components/stack-view-group'
import { useToast } from '@/components/toast'
import { QueryKeys } from '@/constants/query-keys'
import CategoryModel from '@/database/models/category'
import CurrencySelection from '@/pages/app/auth/select-currency'
import StartingBalance from '@/pages/app/auth/starting-balance'
import { useAuthContext } from '@/scopes/auth'
import { useStore } from '@/scopes/livestore'
import { ThemeProvider } from '@/scopes/theme'
import { useRouteQueryControl } from '@/utilities/composables/use-route-query-control'

const Onboarding = () => {
   const router = useRouter()
   const query = useRouteQuery()
   const store = useStore()
   const { completeSetup, userData } = useAuthContext()
   const workspaceId = userData.get()?.workspaces[0]?.id
   const { showToast } = useToast()
   const { remove: clearOnBoarding } = useRouteQueryControl(QueryKeys.Onboarding)
   const currency = query.get(QueryKeys.Onboarding.Currency)
   const currencyIsSet = Cell.derived(() => {
      return currency.get() !== null
   })
   const currencyRef = query.get(QueryKeys.Onboarding.Currency)

   const handleFinish = (startingBalance: number) => {
      const currency = currencyRef.get()
      if (!currency) {
         showToast({ content: 'Please select a currency.', duration: 2000 })
         return
      }
      if (!workspaceId) {
         return
      }
      store.commit(CategoryModel.events.categorySeeded({ workspaceId }))
      completeSetup.run({ currency, startingBalance })
   }

   useSetupEffect(() => {
      return () => {
         clearOnBoarding()
      }
   })

   return (
      <ThemeProvider scheme='dark'>
         {() => (
            <StackViewGroup>
               <StackView root>{() => <CurrencySelection />}</StackView>
               <StackView isOpen={currencyIsSet} onCloseRequested={router.back}>
                  {() => <StartingBalance onFinish={handleFinish} />}
               </StackView>
            </StackViewGroup>
         )}
      </ThemeProvider>
   )
}

export default Onboarding
