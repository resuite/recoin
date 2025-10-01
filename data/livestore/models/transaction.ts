import type { TransactionType } from '@/api/database/types'
import { type Doc, Model } from '@/utilities/model'
import { Events, Schema, State } from '@livestore/livestore'

const TransactionModel = new Model({
   table: State.SQLite.table({
      name: 'transactions',
      columns: {
         id: State.SQLite.text({ primaryKey: true }),
         workspaceId: State.SQLite.text(),
         categoryId: State.SQLite.text(),
         type: State.SQLite.text<TransactionType, TransactionType>({}),
         amount: State.SQLite.integer(),
         currency: State.SQLite.text(),
         label: State.SQLite.text(),
         date: State.SQLite.integer({ schema: Schema.DateFromNumber }),
         location: State.SQLite.text({ nullable: true })
      }
   }),

   events: {
      created: Events.synced({
         name: 'v1.TransactionCreated',
         schema: Schema.Struct({
            id: Schema.String,
            workspaceId: Schema.String,
            categoryId: Schema.String,
            type: Schema.String as Schema.Schema<TransactionType>,
            amount: Schema.Number,
            currency: Schema.String,
            label: Schema.String,
            date: Schema.Date,
            location: Schema.optional(Schema.String)
         })
      })
   }
})

TransactionModel.addMaterializers((table) => ({
   'v1.TransactionCreated': (payload) => table.insert(payload)
}))

export type Transaction = Doc<typeof TransactionModel>

export default TransactionModel
