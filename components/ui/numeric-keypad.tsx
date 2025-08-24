import { Cell, For, type SourceCell } from 'retend'
import { useDerivedValue } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import Arrows from '../icons/svg/arrows'
import styles from './numeric-keypad.module.css'

type DivProps = JSX.IntrinsicElements['div']

interface NumericKeypadProps extends DivProps {
   model?: SourceCell<number | null>
   disabled?: JSX.ValueOrCell<boolean>
}

export function NumericKeypad(props: NumericKeypadProps) {
   const { model, disabled: disabledProp, ...rest } = props
   const disabled = useDerivedValue(disabledProp)
   const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', '0']

   const handleBackspace = () => {
      navigator.vibrate?.([5, 5])
      if (!model) {
         return
      }
      const newValue = String(model.get() ?? '')
      if (newValue === '') {
         return
      }
      if (newValue.length === 1) {
         model?.set(null)
      } else {
         model?.set(Number(newValue.slice(0, -1)))
      }
   }

   const enableBackspace = Cell.derived(() => {
      return model?.get() !== null
   })
   const backspaceDisabled = Cell.derived(() => {
      return !enableBackspace.get() || disabled.get()
   })

   return (
      <div {...rest} class={[styles.keypad, rest.class]}>
         {For(keys, (row) => {
            const handleClick = () => {
               navigator.vibrate?.([5, 5])
               const newValue = model?.get() ?? ''
               model?.set(Number(newValue + row.toString()))
            }
            return (
               <button
                  class={styles.button}
                  type='button'
                  disabled={disabled}
                  onClick={handleClick}
               >
                  {row}
               </button>
            )
         })}
         <button
            class={styles.button}
            type='button'
            title='Backspace'
            onClick={handleBackspace}
            disabled={backspaceDisabled}
         >
            <Arrows class={styles.backspaceIcon} />
         </button>
      </div>
   )
}
