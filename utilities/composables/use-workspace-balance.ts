import { useAuthContext } from '@/scopes/auth'
import { useLiveQuery } from '@/scopes/livestore'
import { Schema, sql } from '@livestore/livestore'
import { Cell } from 'retend'

type Balance = {
   balance: Cell<number>
   totalIncome: Cell<number>
   totalExpense: Cell<number>
}

export function useWorkspaceBalance(): Balance {
   const { userData } = useAuthContext()
   const workspace = userData.get()?.workspaces.at(0)
   if (!workspace) {
      return {
         balance: Cell.source(0),
         totalIncome: Cell.source(0),
         totalExpense: Cell.source(0)
      }
   }
   const startingBalance = workspace?.startingBalance ?? 0

   const totalExpenseResult = useLiveQuery({
      query: sql`
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM transactions
    WHERE type = 'expense' AND workspaceId = '${workspace.id}'
  `,
      schema: Schema.Array(Schema.Struct({ total: Schema.Number }))
   })

   const totalIncomeResult = useLiveQuery({
      query: sql`
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM transactions
    WHERE type = 'expense' AND workspaceId = '${workspace.id}'
  `,
      schema: Schema.Array(Schema.Struct({ total: Schema.Number }))
   })

   const totalExpense = Cell.derived(() => {
      return totalExpenseResult.get().at(0)?.total ?? 0
   })

   const totalIncome = Cell.derived(() => {
      return totalIncomeResult.get().at(0)?.total ?? 0
   })

   const balance = Cell.derived(() => {
      return totalIncome.get() - totalExpense.get() + startingBalance
   })

   return { balance, totalIncome, totalExpense }
}
