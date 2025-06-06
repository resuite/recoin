import type { IconProps } from '../index';

export default function Padlock(props: IconProps) {
   return (
      <svg
         {...props}
         xmlns='http://www.w3.org/2000/svg'
         viewBox='0 0 25 25'
         fill='none'
      >
         <title xmlns='http://www.w3.org/2000/svg'>Padlock</title>
         <path
            d='M12.5003 13.833C13.4897 13.8332 14.2913 14.6356 14.2913 15.625C14.2911 16.6143 13.4896 17.4158 12.5003 17.416C11.5109 17.416 10.7085 16.6144 10.7083 15.625C10.7083 14.6355 11.5108 13.833 12.5003 13.833Z'
            stroke='currentColor'
            stroke-width='1.5'
            xmlns='http://www.w3.org/2000/svg'
         />
         <path
            d='M15.625 9.375C17.5891 9.375 18.5712 9.375 19.1814 9.9852C19.7916 10.5954 19.7916 11.5775 19.7916 13.5417V15.625V17.7083C19.7916 19.6725 19.7916 20.6546 19.1814 21.2648C18.5712 21.875 17.5891 21.875 15.625 21.875H12.5H9.37498C7.41079 21.875 6.4287 21.875 5.81851 21.2648C5.20831 20.6546 5.20831 19.6725 5.20831 17.7083V15.625V13.5417C5.20831 11.5775 5.20831 10.5954 5.81851 9.9852C6.4287 9.375 7.41079 9.375 9.37498 9.375H12.5H15.625Z'
            stroke='currentColor'
            stroke-width='1.5'
            stroke-linejoin='round'
            xmlns='http://www.w3.org/2000/svg'
         />
         <path
            d='M9.375 9.375V5.20833C9.375 4.05774 10.3077 3.125 11.4583 3.125H13.5417C14.6923 3.125 15.625 4.05774 15.625 5.20833V9.375'
            stroke='currentColor'
            stroke-width='1.5'
            stroke-linecap='round'
            stroke-linejoin='round'
            xmlns='http://www.w3.org/2000/svg'
         />
      </svg>
   );
}
