import type { IconProps } from '../index'

export default function Grid(props: IconProps) {
   return (
      <svg {...props} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 25 25' fill='none'>
         <title xmlns='http://www.w3.org/2000/svg'>Grid</title>
         <path
            d='M3.125 9.35C3.125 4.22371 4.22371 3.125 9.35 3.125H15.65C20.7762 3.125 21.875 4.22371 21.875 9.35V15.65C21.875 20.7762 20.7762 21.875 15.65 21.875H9.35C4.22371 21.875 3.125 20.7762 3.125 15.65V9.35Z'
            stroke='currentColor'
            stroke-width='1.5'
            xmlns='http://www.w3.org/2000/svg'
         />
         <path
            d='M12.5 3.125V21.875'
            stroke='currentColor'
            stroke-width='1.5'
            stroke-linecap='round'
            stroke-linejoin='round'
            xmlns='http://www.w3.org/2000/svg'
         />
         <path
            d='M21.875 12.5H12.5'
            stroke='currentColor'
            stroke-width='1.5'
            stroke-linecap='round'
            stroke-linejoin='round'
            xmlns='http://www.w3.org/2000/svg'
         />
      </svg>
   )
}
