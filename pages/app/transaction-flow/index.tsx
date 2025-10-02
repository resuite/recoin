import { FullScreenTransitionView } from '@/components/views/full-screen-transition-view'
import { QueryKeys } from '@/constants/query-keys'
import ChooseCategory from '@/pages/app/transaction-flow/choose-category'
import ChooseTransactionType from '@/pages/app/transaction-flow/choose-transaction-type'
import EnterTransactionDetails from '@/pages/app/transaction-flow/enter-transaction-details'
import TransactionSuccessful from '@/pages/app/transaction-flow/transaction-successful'
import { TransactionDetailsFormScope } from '@/scopes/forms'
import { useRouteQueryControl } from '@/utilities/composables/use-route-query-control'
import { Cell, useScopeContext, useSetupEffect } from 'retend'
import { useRouteQuery } from 'retend/router'

const TransactionFlow = () => {
   const query = useRouteQuery()
   const form = useScopeContext(TransactionDetailsFormScope)

   const type = query.get(QueryKeys.TransactionFlow.Type)
   const category = query.get(QueryKeys.TransactionFlow.Category)
   const { hasKey: completed } = useRouteQueryControl(QueryKeys.TransactionFlow.Success)
   const typeChosen = Cell.derived(() => {
      return type.get() !== null
   })
   const categoryChosen = Cell.derived(() => {
      return category.get() !== null
   })

   useSetupEffect(() => {
      return () => {
         form.reset()
      }
   })

   return (
      <FullScreenTransitionView
         when={typeChosen}
         transition='blink'
         speed='default'
         from={ChooseTransactionType}
         to={() => (
            <FullScreenTransitionView
               when={categoryChosen}
               transition='blink'
               speed='default'
               from={ChooseCategory}
               to={() => (
                  <FullScreenTransitionView
                     when={completed}
                     transition='blink'
                     speed='default'
                     from={EnterTransactionDetails}
                     to={TransactionSuccessful}
                  />
               )}
            />
         )}
      />
   )
}

export default TransactionFlow
