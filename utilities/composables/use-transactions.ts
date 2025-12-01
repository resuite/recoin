import TransactionModel, { type Transaction } from '@/database/models/transaction'
import { useLiveQuery } from '@/scopes/livestore'
import { useWorkspaceId } from '@/utilities/composables/use-workspace-id'
import { Cell } from 'retend'

export interface TransactionDateGroup {
   dateStoredValue: number
   transactions: Cell<Array<Transaction>>
}

export function useTransactions() {
   const workspaceId = useWorkspaceId()
   const transactions = useLiveQuery(
      TransactionModel.table.where({ workspaceId }).orderBy('date', 'desc')
   )
   return transactions as Cell<Array<Transaction>>
}

export function useTransaction(id: string) {
   const workspaceId = useWorkspaceId()
   const transactions = useLiveQuery(TransactionModel.table.where({ workspaceId, id }).first())
   return transactions as Cell<Transaction | null>
}

export function useGroupedTransactions(): Cell<Array<TransactionDateGroup>> {
   const flatTransactions = useTransactions()

   const map = Cell.derived(() => {
      const groupMap = new Map<number, Array<Transaction>>()
      for (const transaction of flatTransactions.get()) {
         const date = new Date(transaction.date)
         date.setHours(0, 0, 0, 0)
         const dateStoredValue = date.getTime()
         let group = groupMap.get(dateStoredValue)
         if (!group) {
            group = []
            groupMap.set(dateStoredValue, group)
         }
         group.push(transaction)
      }
      return groupMap
   })

   return Cell.derived(() => {
      const dates = map.get().keys().toArray()
      return dates.map((dateStoredValue) => {
         return {
            dateStoredValue,
            transactions: Cell.derived(() => {
               // This is re-derived so that updates can be granular.
               return map.get().get(dateStoredValue) || []
            })
         }
      })
   })
}
