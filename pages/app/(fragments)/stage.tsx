import { QueryKeys } from '@/constants/query-keys'
import { useRouteQueryControl } from '@/utilities/composables/use-route-query-control'
import type { JSX } from 'retend/jsx-runtime'

type DivProps = JSX.IntrinsicElements['div']
interface StageProps extends DivProps {}

export const Stage = (props: StageProps) => {
   const { hasKey: transactionFlowIsOpen } = useRouteQueryControl(QueryKeys.TransactionFlow)
   return (
      <div
         {...props}
         class={[
            'translate-0 h-full light-scheme rounded-t-3xl',
            'duration-bit-slower transition-transform ease',
            { 'translate-y-3 scale-90': transactionFlowIsOpen },
            props.class
         ]}
      />
   )
}
