import TransactionModel, { type Transaction } from '@/database/models/transaction'
import { useLiveQuery } from '@/scopes/livestore'
import { useWorkspaceId } from '@/utilities/composables/use-workspace-id'
import type { Cell } from 'retend'

export function useTransactions() {
   const workspaceId = useWorkspaceId()
   const transactions = useLiveQuery(
      TransactionModel.table.where({ workspaceId }).orderBy('date', 'desc')
   )
   return transactions as Cell<Array<Transaction>>
}
