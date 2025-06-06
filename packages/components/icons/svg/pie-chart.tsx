import type { IconProps } from '../index';

export default function PieChart(props: IconProps) {
   return (
      <svg
         {...props}
         xmlns='http://www.w3.org/2000/svg'
         viewBox='0 0 25 26'
         fill='none'
      >
         <title xmlns='http://www.w3.org/2000/svg'>Pie Chart</title>
         <path
            d='M19.7917 13.0007C20.9423 13.0007 21.899 13.9452 21.6464 15.0677C20.705 19.2509 16.9674 22.3757 12.5 22.3757C7.32233 22.3757 3.125 18.1784 3.125 13.0007C3.125 8.53323 6.24978 4.79563 10.4329 3.85429C11.5554 3.60169 12.5 4.55839 12.5 5.70899V10.9173C12.5 12.0679 13.4327 13.0007 14.5833 13.0007H19.7917Z'
            stroke='currentColor'
            stroke-width='1.5'
            xmlns='http://www.w3.org/2000/svg'
         />
         <path
            d='M21.5326 7.82936C20.9072 6.02313 19.4769 4.59276 17.6706 3.96741C16.5833 3.59098 15.625 4.55771 15.625 5.7083V7.79164C15.625 8.94223 16.5577 9.87497 17.7083 9.87497H19.7917C20.9423 9.87497 21.909 8.91663 21.5326 7.82936Z'
            stroke='currentColor'
            stroke-width='1.5'
            xmlns='http://www.w3.org/2000/svg'
         />
      </svg>
   );
}
