import type { EventDef, Materializer, State } from '@livestore/livestore'

/**
 * Represents a domain model, encapsulating a database table, its events,
 * and the logic (materializers) to update the table state based on those events.
 * @template Table The database table's structure.
 * @template EventMap A map of event types to their definitions.
 */
export class Model<Table, EventMap> {
   table: Table
   events: EventMap
   materializers!: Materializers<EventMap>

   constructor(config: { table: Table; events: EventMap }) {
      this.table = config.table
      this.events = config.events
   }

   addMaterializers(cb: (table: Table) => Materializers<EventMap>) {
      this.materializers = cb(this.table)
   }
}

/**
 * A utility type that extracts the decoded document (row) type from a given `Model`.
 */
export type Doc<
   T extends Model<Table, EventMap>,
   Table extends State.SQLite.TableDef = T['table'],
   EventMap extends Record<string, EventDef.Any> = T['events']
> = State.SQLite.FromTable.RowDecoded<Table>

export type Materializers<EventMap> = EventMap extends Record<string, EventDef.Any>
   ? {
        [EventName in EventMap[keyof EventMap]['name'] as Extract<
           EventMap[keyof EventMap],
           { name: EventName }
        >['options']['derived'] extends true
           ? never
           : EventName]: Materializer<Extract<EventMap[keyof EventMap], { name: EventName }>>
     }
   : never
