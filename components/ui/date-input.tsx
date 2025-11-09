import Calendar from '@/components/icons/svg/calendar'
import { Cell, type SourceCell } from 'retend'
import styles from './date-input.module.css'
import { Input, type InputProps } from './input'

interface DateInputProps extends InputProps<'date'> {
   ref?: SourceCell<HTMLInputElement | null>
}

const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }

export function DateInput(props: DateInputProps) {
   const { ref = Cell.source(null), model, ...rest } = props
   const max = new Date().toLocaleDateString(navigator.languages[0])

   const inputIsUnfilled = Cell.derived(() => {
      return !model?.get()
   })

   const value = Cell.derived(() => {
      return model?.get().toLocaleDateString('en-GB', options) || props.placeholder
   })

   const handlePlaceholderClick = () => {
      ref.get()?.focus()
   }

   const handlePlaceholderKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
         e.preventDefault()
         ref.get()?.focus()
      }
   }

   return (
      <div data-unfilled={inputIsUnfilled} class={styles.dateInputContainer}>
         <div
            class={styles.datePlaceholder}
            onClick={handlePlaceholderClick}
            onKeyDown={handlePlaceholderKeyDown}
         >
            {value}
            <Calendar class={styles.dateInputCalendarIcon} />
         </div>

         <Input model={model} ref={ref} max={max} type='date' {...rest} />
      </div>
   )
}
