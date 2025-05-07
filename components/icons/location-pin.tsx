import type { IconProps } from "../icon";

export default function LocationPin(props: IconProps) {
   return (
      <svg
         {...props}
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 12 12"
         fill="none"
      >
         <title xmlns="http://www.w3.org/2000/svg">Location Pin</title>
         <g
            clip-path="url(#clip0_1580_9943)"
            xmlns="http://www.w3.org/2000/svg"
         >
            <path
               d="M10 5.4165C10 8.33319 6.25002 10.8332 6.25002 10.8332C6.25002 10.8332 2.5 8.33319 2.5 5.4165C2.5 4.42194 2.89509 3.46812 3.59835 2.76485C4.30161 2.06159 5.25544 1.6665 6.25002 1.6665C7.24456 1.6665 8.19839 2.06159 8.90166 2.76485C9.60493 3.46812 10 4.42194 10 5.4165Z"
               stroke="currentColor"
               stroke-width="0.83"
               stroke-linecap="round"
               stroke-linejoin="round"
               xmlns="http://www.w3.org/2000/svg"
            />
            <path
               d="M6.25 6.667C6.94034 6.667 7.50001 6.10733 7.50001 5.41699C7.50001 4.72664 6.94034 4.16699 6.25 4.16699C5.55966 4.16699 5 4.72664 5 5.41699C5 6.10733 5.55966 6.667 6.25 6.667Z"
               stroke="currentColor"
               stroke-width="0.83"
               stroke-linecap="round"
               stroke-linejoin="round"
               xmlns="http://www.w3.org/2000/svg"
            />
         </g>
         <defs xmlns="http://www.w3.org/2000/svg">
            <clipPath id="clip0_1580_9943" xmlns="http://www.w3.org/2000/svg">
               <rect
                  width="11"
                  height="11"
                  fill="white"
                  transform="translate(0.75 0.75)"
                  xmlns="http://www.w3.org/2000/svg"
               />
            </clipPath>
         </defs>
      </svg>
   );
}
