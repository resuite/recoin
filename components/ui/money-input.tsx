import { Cell, type SourceCell } from 'retend'
import { useDerivedValue } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import styles from './money-input.module.css'

type InputProps = JSX.IntrinsicElements['input']
interface MoneyInputProps extends InputProps {
   model: SourceCell<number>
   currency: JSX.ValueOrCell<string>
}

export function MoneyInput(props: MoneyInputProps) {
   const { model, currency: currencyProp, ...rest } = props
   const currency = useDerivedValue(currencyProp)
   const inputRef = Cell.source<HTMLInputElement | null>(null)
   const formatter = Cell.derived(() => {
      return new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: currency.get(),
         minimumFractionDigits: 0,
         currencyDisplay: 'narrowSymbol'
      })
   })
   const outerValueFormatted = Cell.derived(() => {
      return formatter.get().format(model.get())
   })

   outerValueFormatted.listen((value) => {
      const input = inputRef.get()
      if (!input) {
         return
      }
      input.value = value
   })

   const update = (event: Event) => {
      const target = event.target as HTMLInputElement
      const cleaned = target.value.replace(/[^0-9.-]+/g, '')
      const numeric = Number.parseFloat(cleaned)
      model.set(numeric || 0)
   }

   return (
      <div class={styles.moneyInputContainer}>
         <input
            {...rest}
            class={[styles.input, rest.class]}
            ref={inputRef}
            type='text'
            onInput={update}
            value={outerValueFormatted}
            inputmode='decimal'
            placeholder='Amount'
         />
      </div>
   )
}
