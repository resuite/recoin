import CategoryModel from '@/database/models/category'
import TransactionModel from '@/database/models/transaction'
import UserModel from '@/database/models/user'
import WorkspaceModel from '@/database/models/workspace'
import { State, makeSchema } from '@livestore/livestore'

export const schema = makeSchema({
   events: {
      ...UserModel.events,
      ...WorkspaceModel.events,
      ...CategoryModel.events,
      ...TransactionModel.events
   },
   state: State.SQLite.makeState({
      tables: {
         users: UserModel.table,
         workspaces: WorkspaceModel.table,
         categories: CategoryModel.table,
         transactions: TransactionModel.table
      },
      materializers: {
         ...UserModel.materializers,
         ...WorkspaceModel.materializers,
         ...CategoryModel.materializers,
         ...TransactionModel.materializers
      }
   })
})
