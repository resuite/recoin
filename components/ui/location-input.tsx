import Location from '@/components/icons/svg/location'
import { Cell, type SourceCell } from 'retend'
import { Input, type InputProps } from 'retend-utils/components'
import styles from './location-input.module.css'

interface LocationInputProps extends InputProps<'text'> {
   ref?: SourceCell<HTMLInputElement | null>
}

export function LocationInput(props: LocationInputProps) {
   const { ref = Cell.source(null), ...rest } = props

   const handlePlaceholderClick = () => {
      ref.get()?.focus()
   }

   return (
      <div class={styles.locationInputContainer}>
         <div
            class={styles.locationPlaceholder}
            onClick={handlePlaceholderClick}
            onKeyDown={handlePlaceholderClick}
         >
            <Location class={styles.locationInputLocationIcon} />
         </div>

         <Input ref={ref} type='text' {...rest} />
      </div>
   )
}
