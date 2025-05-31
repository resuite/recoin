import type { IconProps } from "../index";

export default function Calendar(props: IconProps) {
   return (
      <svg
         {...props}
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 20 21"
         fill="none"
      >
         <title xmlns="http://www.w3.org/2000/svg">Calendar</title>
         <path
            d="M2.5 9.27188C2.5 5.62652 3.28131 4.84521 6.92667 4.84521H13.0733C16.7187 4.84521 17.5 5.62652 17.5 9.27188V13.7519C17.5 17.3972 16.7187 18.1785 13.0733 18.1785H6.92667C3.28131 18.1785 2.5 17.3972 2.5 13.7519V9.27188Z"
            stroke="currentColor"
            stroke-width="1.25"
            xmlns="http://www.w3.org/2000/svg"
         />
         <path
            d="M5 4.84513V3.17847"
            stroke="currentColor"
            stroke-width="1.25"
            stroke-linecap="round"
            xmlns="http://www.w3.org/2000/svg"
         />
         <path
            d="M15 4.84513V3.17847"
            stroke="currentColor"
            stroke-width="1.25"
            stroke-linecap="round"
            xmlns="http://www.w3.org/2000/svg"
         />
         <path
            d="M2.91663 8.17847H17.0833"
            stroke="currentColor"
            stroke-width="1.25"
            stroke-linecap="round"
            xmlns="http://www.w3.org/2000/svg"
         />
      </svg>
   );
}
