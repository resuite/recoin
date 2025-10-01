import CategoryModel from '@/database/models/category'
import TransactionModel from '@/database/models/transaction'
import { State, makeSchema } from '@livestore/livestore'

export const schema = makeSchema({
   events: {
      ...CategoryModel.events,
      ...TransactionModel.events
   },
   state: State.SQLite.makeState({
      tables: {
         categories: CategoryModel.table,
         transactions: TransactionModel.table
      },
      materializers: {
         ...CategoryModel.materializers,
         ...TransactionModel.materializers
      }
   })
})
