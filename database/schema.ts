import { makeSchema, State } from '@livestore/livestore'
import AchievementModel from '@/database/models/achievement'
import CategoryModel from '@/database/models/category'
import TransactionModel from '@/database/models/transaction'

export const schema = makeSchema({
   events: {
      ...AchievementModel.events,
      ...CategoryModel.events,
      ...TransactionModel.events
   },
   state: State.SQLite.makeState({
      tables: {
         achievements: AchievementModel.table,
         categories: CategoryModel.table,
         transactions: TransactionModel.table
      },
      materializers: {
         ...AchievementModel.materializers,
         ...CategoryModel.materializers,
         ...TransactionModel.materializers
      }
   })
})
