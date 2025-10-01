import { State, makeSchema } from '@livestore/livestore'

import CategoryModel from './models/category'
import TransactionModel from './models/transaction'
import UserModel from './models/user'
import WorkspaceModel from './models/workspace'

export const RECOIN_BASE_SCHEMA = makeSchema({
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
