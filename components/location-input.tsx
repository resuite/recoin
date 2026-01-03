import { Cell, type SourceCell } from 'retend'
import Location from '@/components/icons/svg/location'
import { Input, type InputProps } from './input'
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
         {/* biome-ignore lint/a11y/noStaticElementInteractions: overriding native ui. */}
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
