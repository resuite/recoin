import type { IconProps } from "../../icon";

export default function ChatBubble(props: IconProps) {
   return (
      <svg
         {...props}
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 25 25"
         fill="none"
      >
         <title xmlns="http://www.w3.org/2000/svg">Chat Bubble</title>
         <path
            d="M7.29169 9.375H17.7084"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            xmlns="http://www.w3.org/2000/svg"
         />
         <path
            d="M7.29169 12.5H13.5417"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            xmlns="http://www.w3.org/2000/svg"
         />
         <path
            d="M21.875 13.5417V7.29167C21.875 5.32748 21.875 4.34539 21.2648 3.7352C20.6546 3.125 19.6725 3.125 17.7083 3.125H7.29167C5.32748 3.125 4.34539 3.125 3.7352 3.7352C3.125 4.34539 3.125 5.32748 3.125 7.29167V13.5417C3.125 15.5058 3.125 16.4879 3.7352 17.0981C4.34539 17.7083 5.32748 17.7083 7.29167 17.7083H9.375H9.39919C9.70815 17.7083 9.99531 17.8675 10.1591 18.1295L12.3583 21.6483C12.4237 21.753 12.5762 21.753 12.6417 21.6483L14.8901 18.0508C15.0232 17.8377 15.2568 17.7083 15.508 17.7083H15.625H17.7083C19.6725 17.7083 20.6546 17.7083 21.2648 17.0981C21.875 16.4879 21.875 15.5058 21.875 13.5417Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
            xmlns="http://www.w3.org/2000/svg"
         />
      </svg>
   );
}
