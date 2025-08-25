import Arrows from '@/components/icons/svg/arrows'
import { Button } from '@/components/ui/button'
import { defer } from '@/utilities/miscellaneous'
import { Cell, For, type SourceCell, useObserver } from 'retend'
import { useDerivedValue } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import styles from './numeric-keypad.module.css'

type DivProps = JSX.IntrinsicElements['div']

interface NumericKeypadProps extends DivProps {
   model?: SourceCell<string | null>
   disabled?: JSX.ValueOrCell<boolean>
   ref?: SourceCell<HTMLDivElement | null>
}

export function NumericKeypad(props: NumericKeypadProps) {
   const { model, disabled: disabledProp, ref = Cell.source(null), ...rest } = props
   const observer = useObserver()
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
         model?.set(newValue.slice(0, -1))
      }
   }

   const enableBackspace = Cell.derived(() => {
      return model?.get() !== null
   })

   const backspaceDisabled = Cell.derived(() => {
      return !enableBackspace.get() || disabled.get()
   })

   const handleKeydown = (event: KeyboardEvent) => {
      const number = Number(event.key)
      if (!Number.isNaN(number)) {
         navigator.vibrate?.([5, 5])
         const newValue = model?.get() ?? ''
         model?.set(newValue + number.toString())
      } else if (event.key === 'Backspace') {
         handleBackspace()
      }
   }

   observer.onConnected(ref, () => {
      window.addEventListener('keydown', handleKeydown)
      return () => {
         window.removeEventListener('keydown', handleKeydown)
      }
   })

   disabled.listen((disabled) => {
      if (disabled) {
         window.removeEventListener('keydown', handleKeydown)
      } else {
         window.addEventListener('keydown', handleKeydown)
      }
   })

   return (
      <div {...rest} ref={ref} class={[styles.keypad, rest.class]}>
         {For(keys, (row) => {
            const selectChar = (event: Event) => {
               const target = event.currentTarget as HTMLButtonElement
               if (event.type === 'pointerdown') {
                  // Prevents click from firing, given that pointerdown has already handled
                  // adding the character.
                  const preventDblClick = (event: Event) => {
                     event.preventDefault()
                  }
                  target.addEventListener('click', preventDblClick, { capture: true, once: true })
                  defer(() => {
                     target.removeEventListener('click', preventDblClick)
                  })
               }

               if (event.defaultPrevented) {
                  return
               }
               navigator.vibrate?.([5, 5])
               const newValue = model?.get() ?? ''
               model?.set(newValue + row.toString())
            }

            return (
               <Button
                  class={styles.button}
                  type='button'
                  disabled={disabled}
                  onPointerDown={selectChar}
                  onClick={selectChar}
               >
                  {row}
               </Button>
            )
         })}
         <Button
            class={styles.button}
            type='button'
            title='Backspace'
            onClick={handleBackspace}
            disabled={backspaceDisabled}
         >
            <Arrows class={styles.backspaceIcon} />
         </Button>
      </div>
   )
}
