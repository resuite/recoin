import { Switch } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import type { TransactionType } from '@/api/database/types'

interface TransactionTypeNameProps {
   type: JSX.ValueOrCell<TransactionType>
}

export const TransactionTypeName = (props: TransactionTypeNameProps) => {
   const { type } = props
   return Switch(type, {
      expense: () => 'Expense',
      income: () => 'Income'
   })
}
