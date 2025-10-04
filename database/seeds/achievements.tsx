import type { VerticalPanContext } from '@/components/views/vertical-pan-view'
import type { Achievement } from '@/database/models/achievement'
import AchievementModel from '@/database/models/achievement'
import type { RecoinStore } from '@/database/store'
import NewCoin from '@/pages/app/new-coin'
import { timeout } from '@/utilities/animations'
import { type LiveStoreSchema, Schema, type Store, queryDb, sql } from '@livestore/livestore'

interface AchievementTrigger {
   id: string
   achievement: () => Omit<Achievement, 'id' | 'workspaceId'>
   criteria: string
}

export const ALL_ACHIEVEMENTS: Array<AchievementTrigger> = [
   {
      id: '1c368e55-0eca-49ad-bef9-d994ab88b3ef',
      criteria: sql`SELECT EXISTS(SELECT 1 FROM transactions) AS result;`,
      achievement: () => {
         return {
            name: 'first_transaction',
            icon: 'atom'
         }
      }
   }
]

export function createAchievementListener<T extends LiveStoreSchema>(
   store: Store<T>,
   workspaceId: string,
   panCtx: VerticalPanContext
) {
   for (const { id, achievement, criteria } of ALL_ACHIEVEMENTS) {
      const triggerQuery$ = queryDb({
         query: criteria,
         schema: Schema.Array(Schema.Struct({ result: Schema.Number }))
      })

      const unsubscribe = store.subscribe(triggerQuery$, {
         async onUpdate(results) {
            const criteriaReached = results.every((done) => {
               return done.result === 1
            })
            if (!criteriaReached) {
               return
            }

            const achievementAlreadyUnlocked = (
               store.query({
                  query: sql`SELECT EXISTS(SELECT 1 FROM achievements WHERE id = '${id}') AS result;`,
                  bindValues: {}
               }) as unknown as Array<{ result: number }>
            ).every((done) => {
               return done.result === 1
            })

            if (achievementAlreadyUnlocked) {
               return
            }

            const event = AchievementModel.events.achievementCreated({
               id,
               workspaceId,
               ...achievement()
            })
            await timeout(1500)
            panCtx.open(() => <NewCoin achievement={event.args} />)
            const _store = store as unknown as RecoinStore
            _store.commit(event)
            unsubscribe()
         }
      })
   }
}
