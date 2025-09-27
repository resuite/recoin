import { Cell, type SourceCell } from 'retend'

type MakeReactiveKeys<T extends object> = {
   [K in keyof T]: SourceCell<T[K]>
}
export interface Form<Values extends object> {
   reset: () => void
   values: MakeReactiveKeys<Values>
}

export function createForm<Values extends object>(defaultValues: Values): Form<Values> {
   const values = Object.fromEntries(
      Object.entries(defaultValues).map(([key, value]) => {
         return [key, Cell.source(value)]
      })
   ) as MakeReactiveKeys<Values>

   return {
      values,
      reset() {
         for (const key in values) {
            values[key].set(defaultValues[key])
         }
      }
   }
}
