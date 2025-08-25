import { NumericKeypad } from '@/components/ui/numeric-keypad'
import { animationsSettled } from '@/utilities/animations'
import { Cell, For, If } from 'retend'
import { useDerivedValue } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import styles from './pin-input.module.css'

interface PinInputProps {
   /**
    * The number of digits in the PIN.
    * @default 4
    */
   length?: JSX.ValueOrCell<number>
   /**
    * A callback function that is called when the user has filled in all the digits.
    * It receives the PIN as a string and should return a promise that resolves to a boolean indicating whether the PIN was correct.
    */
   onFill?: (value: string) => Promise<boolean>
   /**
    * A callback function that is called when `onFill` returns `true`.
    */
   onSuccess?: () => void
   /**
    * A boolean that disables the component.
    * @default false
    */
   disabled?: JSX.ValueOrCell<boolean>
}

/**
 * A component for entering a PIN.
 * It includes a numeric keypad and a display for the entered digits.
 * It handles validation and success states.
 *
 * @example
 * ```tsx
 * import { PinInput } from '@/components/ui/pin-input'
 *
 * function MyPinComponent() {
 *   const handleFill = async (pin: string) => {
 *     console.log('Filled with pin:', pin)
 *     // Replace with your actual validation logic
 *     return pin === '1234'
 *   }
 *
 *   const handleSuccess = () => {
 *     console.log('PIN correct!')
 *   }
 *
 *   return (
 *     <PinInput
 *       length={4}
 *       onFill={handleFill}
 *       onSuccess={handleSuccess}
 *     />
 *   )
 * }
 * ```
 */
export function PinInput(props: PinInputProps) {
   const { onFill, length: lengthProp = 4, onSuccess, disabled: disabledProp = false } = props
   const number = Cell.source<string | null>(null)
   const outputRef = Cell.source<HTMLOutputElement | null>(null)
   const length = useDerivedValue(lengthProp)
   const disabled = useDerivedValue(disabledProp)
   const errored = Cell.source(false)

   const boxes = Cell.derived(() => {
      return Array(length.get()).fill(null)
   })

   const keypadDisabled = Cell.derived(() => {
      const value = number.get()
      return (value !== null && value.length === 4) || disabled.get()
   })

   number.listen(async (value) => {
      if (!value) {
         return
      }

      if (value.length === 4) {
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
