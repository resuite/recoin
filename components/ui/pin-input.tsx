import { NumericKeypad } from '@/components/ui/numeric-keypad'
import { animationsSettled } from '@/utilities/animations'
import { Cell, For, If } from 'retend'
import { useDerivedValue } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import styles from './pin-input.module.css'

interface PinInputProps {
   length?: JSX.ValueOrCell<number>
   onFill?: (value: number) => Promise<boolean>
   onSuccess?: () => void
}

export function PinInput(props: PinInputProps) {
   const { onFill, length: lengthProp = 4, onSuccess } = props
   const number = Cell.source<number | null>(null)
   const outputRef = Cell.source<HTMLOutputElement | null>(null)
   const length = useDerivedValue(lengthProp)
   const errored = Cell.source(false)

   const boxes = Cell.derived(() => {
      return Array(length.get()).fill(null)
   })

   const max = Cell.derived(() => {
      return Number(''.padEnd(length.get() - 1, '9'))
   })

   const keypadDisabled = Cell.derived(() => {
      const value = number.get()
      return value !== null && value > max.get()
   })

   number.listen(async (value) => {
      if (!value) {
         return
      }

      if (value > max.get()) {
         const isSuccessful = await onFill?.(value)
         if (!isSuccessful) {
            errored.set(true)
            navigator.vibrate?.([30, 30, 30])
            await animationsSettled(outputRef)
            errored.set(false)
         } else {
            onSuccess?.()
         }
         number.set(null)
      }
   })

   return (
      <div class={styles.container}>
         <output ref={outputRef} class={[styles.output, { [styles.error]: errored }]}>
            {For(boxes, (_, index) => {
               const char = Cell.derived(() => {
                  const value = number.get()
                  if (value === null) {
                     return ''
                  }
                  return String(value)[index.get()] ?? ''
               })
               const empty = Cell.derived(() => {
                  return char.get() === ''
               })
               return (
                  <div class={[styles.character, { [styles.empty]: empty }]}>
                     {If(char, () => {
                        return <div class={styles.characterValue}>{char}</div>
                     })}
                  </div>
               )
            })}
         </output>
         <NumericKeypad model={number} disabled={keypadDisabled} />
      </div>
   )
}
