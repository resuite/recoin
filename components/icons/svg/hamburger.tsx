import type { IconProps } from '../index'

export default function Hamburger(props: IconProps) {
   return (
      <svg
         {...props}
         viewBox='0 0 25 26'
         fill='none'
         xmlns='http://www.w3.org/2000/svg'
      >
         <title xmlns='http://www.w3.org/2000/svg'>Hamburger Element</title>
         <path
            xmlns='http://www.w3.org/2000/svg'
            d='M3.125 6.375H21.875'
            stroke='currentColor'
            stroke-width='2'
            stroke-linecap='round'
         />
         <path
            xmlns='http://www.w3.org/2000/svg'
            d='M3.125 13.25H15.625'
            stroke='currentColor'
            stroke-width='2'
            stroke-linecap='round'
         />
         <path
            xmlns='http://www.w3.org/2000/svg'
            d='M3.125 20.125H21.875'
            stroke='currentColor'
            stroke-width='2'
            stroke-linecap='round'
         />
      </svg>
   )
}
