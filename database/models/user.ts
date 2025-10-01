import { type Doc, Model } from '@/utilities/model'
import { Events, Schema, State } from '@livestore/livestore'

const UserModel = new Model({
   table: State.SQLite.table({
      name: 'users',
      columns: {
         id: State.SQLite.text({ primaryKey: true }),
         googleId: State.SQLite.text(),
         email: State.SQLite.text(),
         firstName: State.SQLite.text({ nullable: true }),
         lastName: State.SQLite.text({ nullable: true }),
         fullName: State.SQLite.text({ nullable: true }),
         avatarUrl: State.SQLite.text({ nullable: true }),
         createdAt: State.SQLite.integer({ schema: Schema.DateFromNumber })
      }
   }),

   events: {
      created: Events.synced({
         name: 'v1.UserCreated',
         schema: Schema.Struct({
            id: Schema.String,
            googleId: Schema.String,
            email: Schema.String,
            firstName: Schema.String,
            lastName: Schema.String,
            fullName: Schema.String,
            createdAt: Schema.Date
         })
      })
   }
})

UserModel.addMaterializers((table) => {
   return {
      'v1.UserCreated': (payload) => {
         return table.insert(payload)
      }
   }
})

export type User = Doc<typeof UserModel>
export default UserModel
