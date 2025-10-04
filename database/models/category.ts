import type { TransactionType } from '@/api/database/types'
import type { IconName } from '@/components/icons'
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@/database/seeds'
import { type Doc, Model } from '@/utilities/model'
import { Events, Schema, State } from '@livestore/livestore'

const CategoryModel = new Model({
   table: State.SQLite.table({
      name: 'categories',
      columns: {
         id: State.SQLite.text({ primaryKey: true }),
         workspaceId: State.SQLite.text(),
         name: State.SQLite.text(),
         icon: State.SQLite.text<IconName, IconName>({}),
         type: State.SQLite.text<TransactionType, TransactionType>({})
      }
   }),

   events: {
      categorySeeded: Events.synced({
         name: 'v1.CategorySeeded',
         schema: Schema.Struct({
            workspaceId: Schema.String
         })
      }),
      categoryCreated: Events.synced({
         name: 'v1.CategoryCreated',
         schema: Schema.Struct({
            id: Schema.String,
            workspaceId: Schema.String,
            name: Schema.String,
            icon: Schema.String as Schema.Schema<IconName>,
            type: Schema.String as Schema.Schema<TransactionType>
         })
      })
   }
})

CategoryModel.addMaterializers((table) => ({
   'v1.CategoryCreated': (payload) => table.insert(payload),
   'v1.CategorySeeded': ({ workspaceId }) => {
      const categories = [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES]
      return categories.map((category) => table.insert({ ...category, workspaceId }))
   }
}))

export type Category = Doc<typeof CategoryModel>

export default CategoryModel
