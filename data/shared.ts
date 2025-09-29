import type { Category } from '@/api/database/types'
type ResponseMap<T extends string = string> = Record<T, (input: never) => unknown>

export type Sender<
   RMap extends ResponseMap<RKey>,
   RKey extends keyof RMap & string = keyof RMap & string
> = <Key extends RKey>(payload: WorkerRequest<RMap, Key>) => ReturnType<RMap[Key]>

export type WorkerChannel<
   RMap extends ResponseMap<RKey>,
   RKey extends keyof RMap & string = keyof RMap & string
> = { send: Sender<RMap> }

export type WorkerRequest<
   RMap extends ResponseMap<RKey>,
   RKey extends keyof RMap & string = keyof RMap & string
> = Parameters<RMap[RKey]>['length'] extends 0
   ? { key: RKey }
   : { key: RKey; payload: Parameters<RMap[RKey]>[0] }

// ---

export const DbWorkerMessages = {
   GetIncomeCategories: 'GetIncomeCategories',
   GetExpenseCategories: 'GetExpenseCategories',
   GetCategoryById: 'GetCategoryById',
   GetHomeStats: 'GetHomeStats'
} as const

export type DbWorkerKey = (typeof DbWorkerMessages)[keyof typeof DbWorkerMessages]

export interface DbWorkerResponseMap extends ResponseMap<DbWorkerKey> {
   [DbWorkerMessages.GetIncomeCategories]: () => Promise<Array<Category>>
   [DbWorkerMessages.GetExpenseCategories]: () => Promise<Array<Category>>
   [DbWorkerMessages.GetCategoryById]: (id: string) => Promise<Category | null>
   [DbWorkerMessages.GetHomeStats]: () => Promise<{
      startingBalance: number
      totalExpense: number
      totalIncome: number
   }>
}
