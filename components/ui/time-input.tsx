import Clock from '@/components/icons/svg/clock'
import { Cell, type SourceCell } from 'retend'
import { Input, type InputProps } from 'retend-utils/components'
import styles from './time-input.module.css'

interface TimeInputProps extends InputProps<'time'> {
   ref?: SourceCell<HTMLInputElement | null>
}

export function TimeInput(props: TimeInputProps) {
   const { ref = Cell.source(null), ...rest } = props

   const inputIsUnfilled = Cell.derived(() => {
      return !props.model?.get()
   })

   const value = Cell.derived(() => {
      const timeStr = props.model?.get()
      if (timeStr) {
         const [hours, minutes] = timeStr.split(':').map(Number)
         const date = new Date()
         date.setHours(hours, minutes, 0, 0)
         return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
         })
      }
      return props.placeholder
   })

   const handlePlaceholderClick = () => {
      ref.get()?.focus()
   }

   return (
      <div data-unfilled={inputIsUnfilled} class={styles.timeInputContainer}>
         <div
            class={styles.timePlaceholder}
            onClick={handlePlaceholderClick}
            onKeyDown={handlePlaceholderClick}
         >
            {value}
            <Clock class={styles.timeInputClockIcon} />
         </div>

         <Input ref={ref} type='time' {...rest} />
      </div>
   )
}
