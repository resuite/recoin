import type { IconProps } from "../../icon";

export default function Clock(props: IconProps) {
   return (
      <svg
         {...props}
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 20 21"
         fill="none"
      >
         <title xmlns="http://www.w3.org/2000/svg">Clock</title>
         <path
            d="M17.5 10.6785C17.5 14.8206 14.1422 18.1785 10 18.1785C5.85787 18.1785 2.5 14.8206 2.5 10.6785C2.5 6.53633 5.85787 3.17847 10 3.17847C14.1422 3.17847 17.5 6.53633 17.5 10.6785Z"
            stroke="currentColor"
            stroke-width="1.25"
            xmlns="http://www.w3.org/2000/svg"
         />
         <path
            d="M10 6.51172V10.2617V10.2781C10 10.5281 10.125 10.7617 10.3332 10.9005L12.5 12.3451"
            stroke="currentColor"
            stroke-width="1.25"
            stroke-linecap="round"
            stroke-linejoin="round"
            xmlns="http://www.w3.org/2000/svg"
         />
      </svg>
   );
}
