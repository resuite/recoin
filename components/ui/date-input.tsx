import Calendar from '@/components/icons/svg/calendar'
import { currentBrowser } from '@/utilities/browser'
import { Cell, type SourceCell, useSetupEffect } from 'retend'
import { Input, type InputProps } from 'retend-utils/components'
import styles from './date-input.module.css'

interface DateInputProps extends InputProps<'date'> {
   ref?: SourceCell<HTMLInputElement | null>
}

const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }

export function DateInput(props: DateInputProps) {
   const { ref = Cell.source(null), ...rest } = props
   const isMobile = Cell.source(false)
   const max = new Date().toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
   })

   const inputIsUnfilled = Cell.derived(() => {
      return !props.model?.get()
   })

   const value = Cell.derived(() => {
      return props.model?.get().toLocaleDateString('en-GB', options) || props.placeholder
   })

   const handlePlaceholderClick = () => {
      ref.get()?.focus()
   }

   useSetupEffect(() => {
      const browser = currentBrowser()
      isMobile.set(browser.getPlatformType() === 'mobile')
   })

   return (
      <div data-unfilled={inputIsUnfilled} data-mobile={isMobile} class={styles.dateInputContainer}>
         <div
            class={styles.datePlaceholder}
            onClick={handlePlaceholderClick}
            onKeyDown={handlePlaceholderClick}
         >
            <span>{value}</span>
            <Calendar class={styles.dateInputCalendarIcon} />
         </div>

         <Input ref={ref} max={max} {...rest} />
      </div>
   )
}
