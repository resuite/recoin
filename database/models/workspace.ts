import { type Doc, Model } from '@/utilities/model'
import { Events, Schema, State } from '@livestore/livestore'

const WorkspaceModel = new Model({
   table: State.SQLite.table({
      name: 'workspaces',
      columns: {
         id: State.SQLite.text({ primaryKey: true }),
         name: State.SQLite.text(),
         userId: State.SQLite.text(),
         createdAt: State.SQLite.integer({ schema: Schema.DateFromNumber }),
         currency: State.SQLite.text({ nullable: true }),
         startingBalance: State.SQLite.integer({ nullable: true, default: 0 })
      }
   }),

   events: {
      created: Events.synced({
         name: 'v1.WorkspaceCreated',
         schema: Schema.Struct({
            id: Schema.String,
            name: Schema.String,
            userId: Schema.String,
            createdAt: Schema.Date
         })
      }),
      onboardingCompleted: Events.synced({
         name: 'v1.WorkspaceOnboardingCompleted',
         schema: Schema.Struct({
            workspaceId: Schema.String,
            currency: Schema.String,
            startingBalance: Schema.Number
         })
      })
   }
})

WorkspaceModel.addMaterializers((table) => {
   return {
      'v1.WorkspaceCreated': (payload) => {
         return table.insert(payload)
      },
      'v1.WorkspaceOnboardingCompleted': ({ workspaceId, ...updates }) => {
         return table.update(updates).where({ id: workspaceId })
      }
   }
})

export type Workspace = Doc<typeof WorkspaceModel>

export default WorkspaceModel
