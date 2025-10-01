import { Cell, type SourceCell } from 'retend'

type MakeReactiveKeys<T extends object> = {
   [K in keyof T]: SourceCell<T[K]>
}
export interface Form<Values extends object> {
   reset: () => void
   values: MakeReactiveKeys<Values>
   submitted: boolean
   submit: () => Promise<void>
}

interface FormOptions<Values extends object> {
   onSubmit?: (values: Values) => void | Promise<void>
}

export function createForm<Values extends object>(
   defaultValues: () => Values,
   options?: FormOptions<Values>
): Form<Values> {
   const values = Object.fromEntries(
      Object.entries(defaultValues()).map(([key, value]) => {
         return [key, Cell.source(value)]
      })
   ) as MakeReactiveKeys<Values>

   return {
      values,
      submitted: false,
      async submit() {
         await options?.onSubmit?.(
            Object.fromEntries(
               Object.entries(values).map(([key, value]) => {
                  return [key, (value as Cell<unknown>).get()]
               })
            ) as Values
         )
         this.submitted = true
      },
      reset() {
         const defaults = defaultValues()
         for (const key in values) {
            values[key].set(defaults[key])
         }
      }
   }
}
