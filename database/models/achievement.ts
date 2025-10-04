import type { IconName } from '@/components/icons'
import { type Doc, Model } from '@/utilities/model'
import { Events, Schema, State } from '@livestore/livestore'

const AchievementModel = new Model({
   table: State.SQLite.table({
      name: 'achievements',
      columns: {
         id: State.SQLite.text({ primaryKey: true }),
         workspaceId: State.SQLite.text(),
         name: State.SQLite.text(),
         icon: State.SQLite.text<IconName, IconName>({}),
         message: State.SQLite.text()
      }
   }),

   events: {
      created: Events.synced({
         name: 'v1.AchievementCreated',
         schema: Schema.Struct({
            id: Schema.String,
            workspaceId: Schema.String,
            name: Schema.String,
            icon: Schema.String as Schema.Schema<IconName>,
            message: Schema.String
         })
      })
   }
})

AchievementModel.addMaterializers((table) => ({
   'v1.AchievementCreated': (payload) => table.insert(payload)
}))

export type Achievement = Doc<typeof AchievementModel>

export default AchievementModel
