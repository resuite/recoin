import type { IconProps } from '../index'

export default function Checkmark(props: IconProps) {
   return (
      <svg
         {...props}
         xmlns='http://www.w3.org/2000/svg'
         viewBox='0 0 26 25'
         fill='none'
      >
         <title xmlns='http://www.w3.org/2000/svg'>Checkmark</title>
         <path
            d='M5.0625 13.2979L9.39863 17.6339'
            stroke='currentColor'
            stroke-width='1.85'
            stroke-linecap='round'
            stroke-linejoin='round'
         />
         <path
            d='M9.39863 17.6339L20.0625 7.29785'
            stroke='currentColor'
            stroke-width='1.85'
            stroke-linecap='round'
            stroke-linejoin='round'
         />
      </svg>
   )
}
