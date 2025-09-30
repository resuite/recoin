import { State, makeSchema } from '@livestore/livestore'

export const RECOIN_BASE_SCHEMA = makeSchema({
   events: {},
   state: State.SQLite.makeState({
      tables: {},
      materializers: {}
   })
})
