import type { TransactionType } from '@/api/database/types'
import Checkmark from '@/components/icons/svg/checkmark'
import { FitText } from '@/components/ui/fit-text'
import { FormattedMoney } from '@/components/ui/formatted-money'
import { useFullScreenTransitionContext } from '@/components/views/full-screen-transition-view'
import { QueryKeys } from '@/constants/query-keys'
import { useAuthContext } from '@/scopes/auth'
import { TransactionDetailsFormScope } from '@/scopes/forms'
import { animationsSettled } from '@/utilities/animations'
import { useRouteQueryControl } from '@/utilities/composables/use-route-query-control'
import { useScopeContext, useSetupEffect } from 'retend'
import { useRouteQuery } from 'retend/router'

const TRANSACTION_SUCCESS_SCREEN_DELAY = 700

const TransactionSuccessful = () => {
   const query = useRouteQuery()
   const { currency } = useAuthContext()
   const { remove: closeTranctionFlow } = useRouteQueryControl(QueryKeys.TransactionFlow)
   const { values } = useScopeContext(TransactionDetailsFormScope)
   const { activeViewRef } = useFullScreenTransitionContext()
   const transactionType = query.get(QueryKeys.TransactionFlow.Type).get() as TransactionType
   const sign = transactionType === 'income' ? '+' : '-'
   const message =
      transactionType === 'income'
         ? 'Income added to your balance.'
         : 'Expense deducted from your balance.'

   useSetupEffect(async () => {
      await animationsSettled(activeViewRef)
      await new Promise((resolve) => setTimeout(resolve, TRANSACTION_SUCCESS_SCREEN_DELAY))
      closeTranctionFlow()
   })

   return (
      <div class='h-full w-full grid grid-cols-1 place-items-center place-content-center text-center'>
         <div class='h-4 w-4 border-4 mb-1 grid place-items-center rounded-full'>
            <Checkmark class='h-3 w-3' />
         </div>
         <FitText class='w-full' scalingFactor={1.5} maxFontSize='var(--text-logo)'>
            <div class='inline-flex gap-0.25'>
               <div>{sign}</div>
               <FormattedMoney currency={currency}>{values.amount.get()}</FormattedMoney>
            </div>
         </FitText>
         <p class='text-header max-w-11'>{message}</p>
      </div>
   )
}

export default TransactionSuccessful
