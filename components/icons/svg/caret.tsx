import { Cell } from 'retend'
import { useDerivedValue } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import type { IconProps } from '../index'

export interface CaretProps extends IconProps {
   direction?: JSX.ValueOrCell<'right' | 'left' | 'top' | 'bottom'>
}

export default function Caret(props: CaretProps) {
   const { direction, ...rest } = props
   const dir = useDerivedValue(direction)

   const rotate = Cell.derived(() => {
      const value = dir.get()
      switch (value) {
         case 'left':
            return '90deg'
         case 'top':
            return '180deg'
         case 'right':
            return '270deg'
      }
   })

   const style = { rotate }
   if (rest.style && typeof rest.style === 'object') {
      Object.assign(rest.style, style)
   }

   return (
      <svg
         {...rest}
         style={style}
         viewBox='0 0 25 25'
         fill='none'
         xmlns='http://www.w3.org/2000/svg'
      >
         <title xmlns='http://www.w3.org/2000/svg'>Caret</title>
         <path
            d='M21 8.25L12.5 16.75L4 8.25'
            stroke='currentColor'
            stroke-width='2.25'
            stroke-linecap='round'
            stroke-linejoin='round'
         />
      </svg>
   )
}
